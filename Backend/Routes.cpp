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
#include <pcl/io/ply_io.h>

void loadDataIntoCloud(std::string& Data, std::string& extension,  pcl::PointCloud<pcl::PointXYZ> cloud)
{
	if (extension == ".ply")
	{
		pcl::io::loadPLYFile(Data, cloud);
	}
}


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

	//Saving of incoming Data as Pointclouds
	CROW_ROUTE(app, "/Import3dScan").methods(crow::HTTPMethod::Post)(
		[URL, source_points, target_points](const crow::request& req)
			{
				crow::multipart::message incomingData(req);

				const auto& part = incomingData.parts[0];
				std::string file_path = "/tmp/uploaded_file"; // Temporary file path
				std::ofstream ofs(file_path, std::ios::binary);
				ofs.write(part.body.data(), part.body.size());
				ofs.close();

				crow::response res; 
				res.add_header("Access-Control-Allow-Origin", URL);

				// Check if there's a file in the parts
				if (incomingData.parts.size() == 0) 
				{
					res.body = "No file sent";
					res.code = 400;
					return res;
				}

				//Check if target_points is empty
				if (source_points->empty())
				{
					//Call load function
					loadDataIntoCloud(file_path, incomingData.parts[1].body, *source_points);

					res.body = "File upload sucessful";
					res.code = 200;
					return res;
				}
				else if (target_points->empty())
				{
					//Call load function
					loadDataIntoCloud(file_path, incomingData.parts[1].body, *target_points);

					res.body = "File upload sucessful";
					res.code = 200;
					return res;
				}
				else
				{
					//return that the shit is full
					res.body = "Allready 2 thingies on the server, consider reloading";
					res.code = 400;
					return res;
				}
			});

	//Delete Handler to delete saved point clouds
	CROW_ROUTE(app, "/delete3DFile").methods(crow::HTTPMethod::Post)
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
		([URL, target_points, source_points, final_points](const crow::request& req) {
		//JSON store object
		crow::json::rvalue receivedData;

		//test to see if its a json object
		try
		{
			receivedData = crow::json::load(req.body);

			if (!receivedData)
			{
				return crow::response(400, "Invalid JSON format"); //wrong data type
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

			int i = 0;
			
			// Iterate over the 4x4 matrix in receivedData
			for (int j = 0; j < 4; j++) 
			{
				for (int k = 0; k < 4; k++)
				{
					//filling the transformation matrix, maybe
					transformation(j, k) = matrixArray[i].d(); 
					i++;
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
				response["transformation"] = matrix_json.dump();
			}
			else {
				// In case it didn't work
				response["message"] = "ICP did not converge";
			}

			// Crow response
			crow::response res(response);
			// Headers:
			res.add_header("Access-Control-Allow-Origin", URL);
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

	//Starts the server
	app.port(18080).multithreaded().run();
}
