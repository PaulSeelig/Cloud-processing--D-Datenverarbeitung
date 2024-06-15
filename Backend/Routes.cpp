#define CROWMAIN

#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <iostream>

//The Crow relevent headers
#include "crow.h" //this needs to be replaced when using Linux to #include "crow_all.h"
#include <crow/json.h>
#include <crow/multipart.h>
#include <crow/middlewares/cors.h>
//The PCL relevant headers
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl/registration/transformation_estimation_svd.h>
#include <pcl/io/pcd_io.h>

int main()
{
	//App
	crow::SimpleApp app;
	//Logger for debugging
	app.loglevel(crow::LogLevel::Info);

	//Weblocation for CORS header
	std::string URL = "http://localhost:5173";

	//Point Clouds where the imported Data gets Saved, can then be deleted with the /delete3DFiles endpoint
	pcl::PointCloud<pcl::PointXYZ>::Ptr source_points(new pcl::PointCloud<pcl::PointXYZ>());
	pcl::PointCloud<pcl::PointXYZ>::Ptr target_points(new pcl::PointCloud<pcl::PointXYZ>());
	//PCD format?? -> put the files in here convert from stl, ply and xyz to pcd pottentially?

	//Code Audrik ------------------------
	CROW_ROUTE(app, "/Import3dScan").methods(crow::HTTPMethod::Post)(
		[URL](const crow::request& req) {

			// Get the content type from the request header
			std::string content_type = req.get_header_value("Content-Type");

			// Check if the content type is multipart/form-data
			if (content_type.find("multipart/form-data") != std::string::npos) {
				// Parse the request body as multipart/form-data
				crow::multipart::message msg(req);

				// Loop through the parts of the message
				for (const auto& part : msg.parts) {
					// Check if the part corresponds to the "File" field
					// Extract the file content
					std::string fileContent = part.body;

					// Validate the file type
					bool isValidFile = false;

					// Check for PLY file
					if (fileContent.find("ply") == 0) {
						isValidFile = true;
					}
					// Check for XYZ file (simple heuristic: check for three columns of floats)
					else if (fileContent.find("# line format @px @py @pz") == 0) {
						// Validate XYZ content format
						std::istringstream iss(fileContent);
						std::string line;
						std::getline(iss, line);  // Skip the header line
						isValidFile = true;
						while (std::getline(iss, line)) {
							std::istringstream lineStream(line);
							float x, y, z;
							if (!(lineStream >> x >> y >> z)) {
								isValidFile = false;
								break;
							}
						}
					}
					// Check for STL file
					else if (fileContent.find("solid") == 0 || fileContent.find("facet") != std::string::npos) {
						isValidFile = true;
					}

					if (isValidFile) {
						crow::response res(200, "Valid 3D file received");
						res.add_header("Access-Control-Allow-Origin", URL);
						return res;
					}
					else {
						return crow::response(400, "Invalid 3D file format");
					}

					//crow::response res(200, "Data recieved");
					//
					//res.add_header("Access-Control-Allow-Origin", URL);
					//// If valid, return the file content back
					//return res;
				}

				// If "File" part not found, return error response
				return crow::response(400, "Missing or invalid file");
			}
			else {
				// If content type is not multipart/form-data, return error response
				return crow::response(400, "Invalid request format");
			}
		}
	);
	//--------------------------



	//Delete Handler to delete saved point clouds
	CROW_ROUTE(app, "/delete3DFiles").methods(crow::HTTPMethod::Delete)
		([&source_points, &target_points](const crow::request& req)
			{
				//deletes
				source_points->clear();
				target_points->clear();

				//clear the saved Data possible PCD
				//checks if deleting was succesful and sends back the appropriete response
				if (source_points->points.empty() && target_points->points.empty()) {
					return crow::response("Point Clouds have been deleted");
				}
				else {
					return crow::response("Error while deleting");
				}
			});

	//ICP Handler sends back a 4x4 transformation Matrix
	CROW_ROUTE(app, "/mergeImportedFiles").methods("POST"_method)
		([URL](const crow::request& req)
			{
				//This will be where the code to deciver the incoming Data
				//recieved json data (if thats how we are doing it)
				crow::json::rvalue recievedData;

				//test to see if its a json object
				try {
					recievedData = crow::json::load(req.body);
				}
				catch (const std::exception& e) {
					return crow::response(400); //wrong data type
				}
				//Logic goes here

				//Crow Response
				crow::json::wvalue response;
				response["message"] = "not implemented yet";
				crow::response res(response);
				res.add_header("Access-Control-Allow-Origin", URL);
				return res;
			});


	//Pointpicking Handler sends back a 4x4 transformation Matrix
	CROW_ROUTE(app, "/pointsPicked").methods(crow::HTTPMethod::POST)
		([URL](const crow::request& req)
			{
				//Innitialization and subsequent conversion from Points picked to Pointclouds
				crow::json::rvalue pickedPoints;

				pcl::PointCloud<pcl::PointXYZ>::Ptr source_points(new pcl::PointCloud<pcl::PointXYZ>());
				pcl::PointCloud<pcl::PointXYZ>::Ptr target_points(new pcl::PointCloud<pcl::PointXYZ>());

				//Test if the send object is a Json Obj
				try
				{
					pickedPoints = crow::json::load(req.body);
				}
				catch (const std::exception& e)
				{
					return crow::response(400);
				}

				//Test if the size is 6 to catch size errors
				if (pickedPoints.size() != 6)
				{
					return crow::response(400, "There is a missmatch between the selected Points");
				}

				//Here is where the filling of the pointclouds will happen
				for (int i = 0; i < pickedPoints.size(); i++)
				{
					//source_points->points.push_back(); //i need to see how the json object loo
					//to differentiate the 2 picked Points
					if (((pickedPoints.size() - 1) / 2) > i)
					{
						//how to extract the exact thingys -> pcl::PointXYZ(x,y,z); //float!
						//target_points->points.push_back();
					}
				}

				// Estimate the transformation matrix using SVD
				pcl::registration::TransformationEstimationSVD<pcl::PointXYZ, pcl::PointXYZ> trans_est;
				pcl::registration::TransformationEstimationSVD<pcl::PointXYZ, pcl::PointXYZ>::Matrix4 transformation;
				trans_est.estimateRigidTransformation(*source_points, *target_points, transformation);

				//response transformation matrix
				crow::json::wvalue json_matrix;
				crow::json::wvalue::list matrix_array;

				//4x4 matrix -> json object
				for (int i = 0; i < 4; ++i) {
					for (int j = 0; j < 4; ++j) {
						matrix_array.push_back(transformation(i, j));
					}
				}

				json_matrix["matrix"] = std::move(matrix_array);

				//Initialize Response
				crow::response res(json_matrix);

				//Headers:
				res.add_header("Access-Control-Allow-Origin", URL);

				return res;
			});

	//Starts the server
	app.port(18080).multithreaded().run();
}
