#define CROWMAIN

#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <iostream>

//The Crow relevent headers
#include "crow.h" //this needs to be replaced when using Linux to #include "crow_all.h"
//#include "crow_all.h"
#include <crow/json.h>
#include <crow/multipart.h>
#include <crow/middlewares/cors.h>

//The PCL relevant headers
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl/registration/icp.h> 
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
	pcl::PointCloud<pcl::PointXYZ>::Ptr source_points(new pcl::PointCloud<pcl::PointXYZ>);
	pcl::PointCloud<pcl::PointXYZ>::Ptr target_points(new pcl::PointCloud<pcl::PointXYZ>);
	//PCD format?? -> put the files in here convert from stl, ply and xyz to pcd pottentially?

	//Output pointcloud
	pcl::PointCloud<pcl::PointXYZ>::Ptr final_points(new pcl::PointCloud<pcl::PointXYZ>);

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
	CROW_ROUTE(app, "/delete3DFile").methods(crow::HTTPMethod::Post)
		([URL](const crow::request& req)
			{
				crow::response res(200, "File deleted with success");
				res.add_header("Access-Control-Allow-Origin", URL);
				return res;
			});

	//ICP Handler sends back a 4x4 transformation Matrix
	CROW_ROUTE(app, "/mergeImportedFiles").methods("POST"_method)
		([URL, target_points, source_points, final_points](const crow::request& req) {
		// JSON store object
		crow::json::rvalue receivedData;

		// Test to see if it's a JSON object
		try {
			crow::multipart::message msg(req);

			// Loop through the parts of the message
			for (const auto& part : msg.parts) {
				// Check if the part corresponds to the "File" field
				// Extract the file content
				std::string fileContent = part.body;
				receivedData = crow::json::load(fileContent);
			}

			if (!receivedData) {
				return crow::response(400, "Invalid JSON format"); // Wrong data type
			}
		}
		catch (const std::exception& e) {
			return crow::response(400, e.what());
		}

		// 4x4 Matrix
		pcl::registration::TransformationEstimationSVD<pcl::PointXYZ, pcl::PointXYZ>::Matrix4 transformation;

		// Extracting the 4x4 Matrix from JSON Object
		try {
			auto matrixArray = receivedData["matrix"];

			// Iterate over the 4x4 matrix in receivedData
			for (int i = 0; i < 4; ++i) {
				for (int j = 0; j < 4; ++j) {
					transformation(i, j) = matrixArray[i][j].d(); // Access double value directly
				}
			}

			// Apply the transformation matrix to the source point cloud
			pcl::transformPointCloud(*source_points, *source_points, transformation);

			// Initialization of ICP and inputting the point clouds
			pcl::IterativeClosestPoint<pcl::PointXYZ, pcl::PointXYZ> icp;
			icp.setInputSource(source_points);
			icp.setInputTarget(target_points);

			// The transformation into a Final "Output" Point Cloud
			icp.align(*final_points);

			// Crow JSON return object
			crow::json::wvalue response;

			// Check if the ICP worked
			if (icp.hasConverged()) {
				// Save the 4x4 Matrix
				pcl::registration::TransformationEstimationSVD<pcl::PointXYZ, pcl::PointXYZ>::Matrix4 finalTransformation = icp.getFinalTransformation();

				// Convert Matrix to JSON
				crow::json::wvalue matrix_json;
				for (int i = 0; i < 4; ++i) {
					for (int j = 0; j < 4; ++j) {
						matrix_json[i][j] = finalTransformation(i, j);
					}
				}

				response["message"] = "Request processed successfully";
				//response["transformation"] = matrix_json;
			}
			else {
				// In case it didn't work
				response["message"] = "ICP did not converge";
			}

			// Crow response
			crow::response res(response);
			// Headers:
			res.add_header("Access-Control-Allow-Origin", "*");
			return res;
		}
		catch (const std::exception& e) {
			return crow::response(200, "File combined with success");
		}


			});


	//Pointpicking Handler sends back a 4x4 transformation Matrix
	CROW_ROUTE(app, "/pointsPicked").methods(crow::HTTPMethod::POST)
		([URL](const crow::request& req)
			{
				//Innitialization and subsequent conversion from Points picked to Pointclouds
				

				//Initialize Response
				crow::response res;
				crow::json::rvalue pickedPoints;

				//Headers:
				res.add_header("Access-Control-Allow-Headers", "Content-Type");
				res.add_header("Access-Control-Allow-Origin", URL);
				res.add_header("Access-Control-Allow-Methods", "POST");

				pcl::PointCloud<pcl::PointXYZ>::Ptr source_points(new pcl::PointCloud<pcl::PointXYZ>());
				pcl::PointCloud<pcl::PointXYZ>::Ptr target_points(new pcl::PointCloud<pcl::PointXYZ>());

				//Test if the send object is a Json Obj
				try
				{
					 pickedPoints = crow::json::load(req.body);
				}
				catch (const std::exception& e)
				{
					res.body = e.what();
					res.code = 200;
					return res;
				}

				//Extraction of pickedPoints from the JSON Object
				for (int i = 0; i < 6; i++)
				{
					pcl::PointXYZ tempPoint;

					try 
					{
						tempPoint.x = pickedPoints[i]["x"].d();
						tempPoint.y = pickedPoints[i]["y"].d();
						tempPoint.z = pickedPoints[i]["z"].d();
					}
					catch (const std::exception& e) 
					{
						return crow::response(400, "Error extracting point data: " + std::string(e.what()));
					}

					// To differentiate the 2 picked Points
					if (i < 3) 
					{
						// The first half goes to the source points
						source_points->points.push_back(tempPoint);
					}
					else 
					{
						// The second half goes to the target points
						target_points->points.push_back(tempPoint);
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

				res.body = json_matrix.dump();
				res.code = 200;
				res.add_header("Content-Type", "application/json");

				return res;
			});

	//// Handle OPTIONS requests for CORS preflight
	//CROW_ROUTE(app, "/pointsPicked").methods("OPTIONS"_method)
	//	([URL](const crow::request& req)
	//		{
	//			crow::response res;

	//			// Set CORS headers
	//			res.add_header("Access-Control-Allow-Origin", URL);
	//			res.add_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	//			res.add_header("Access-Control-Allow-Headers", "Content-Type");

	//			// Respond with no content for OPTIONS requests
	//			return res;
	//		});

	//Starts the server
	app.port(18080).multithreaded().run();
}
