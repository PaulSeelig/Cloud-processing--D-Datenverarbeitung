#define CROWMAIN

#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <iostream>

#include "crow.h"
#include <crow/json.h>
#include <crow/multipart.h>
#include <crow/middlewares/cors.h>
//#include <nlohmann/json.hpp>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>

int main()
{
	//App
	crow::SimpleApp app;
	//Logger for debugging
	app.loglevel(crow::LogLevel::Info);

	//Point Clouds where the imported Data gets Saved, can then be deleted with the /delete3DFiles endpoint
	pcl::PointCloud<pcl::PointXYZ>::Ptr source_points(new pcl::PointCloud<pcl::PointXYZ>());
	pcl::PointCloud<pcl::PointXYZ>::Ptr target_points(new pcl::PointCloud<pcl::PointXYZ>());


	//Code Audrik ------------------------
	CROW_ROUTE(app, "/Import3dScan").methods(crow::HTTPMethod::Post)(
		[](const crow::request& req) {

			
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

					// Validate if the file content is a valid PLY file
				/*	if (!false) {
						return crow::response(400, "Invalid PLY file");
					}*/
					crow::response res(200, fileContent);
					
					res.add_header("Access-Control-Allow-Origin", "http://localhost:5173");
					// If valid, return the file content back
					return res;
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
		([](const crow::request& req) 
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
			res.add_header("Access-Control-Allow-Origin", "http://localhost:5173");
			return res;
		});


	//Pointpicking Handler sends back a 4x4 transformation Matrix
	CROW_ROUTE(app, "/pointsPicked").methods(crow::HTTPMethod::POST)
		([](const crow::request& req) 
		{
			//Innitialization and subsequent conversion from Points picked to Pointclouds
			crow::json::rvalue pickedPoints;

			pcl::PointCloud<pcl::PointXYZ>::Ptr source_points(new pcl::PointCloud<pcl::PointXYZ>());
			pcl::PointCloud<pcl::PointXYZ>::Ptr target_points(new pcl::PointCloud<pcl::PointXYZ>());

			//Test if the send object is a Json Obj
			try {
				pickedPoints = crow::json::load(req.body);
			}
			catch (const std::exception& e) {
				return crow::response(400);
			}
			//Here is where the filling of the pointclouds will happen
			for (int i = 0; i < pickedPoints.size(); i++)
			{
				//to differentiate the 2 picked Points
				if (((pickedPoints.size() - 1) / 2) > i) 
				{
					//how to extract the exact thingys -> pcl::PointXYZ(x,y,z); //float!
					//logic goes here target_points->points.push_back();
				}
			}
			//here is code to allign the 2 using SVD 

			//initialize response
			//response will be a 4x4 Matrix object probably converted to a json object
			crow::json::wvalue combinedData;
			combinedData["message"] = "Data processed successfully";
			combinedData["status"] = "success";

			//Initialize Response
			crow::response res(combinedData);

			//Headers:
			res.add_header("Access-Control-Allow-Origin", "http://localhost:5173");

			return res;
		});

	//Starts the server
	app.port(18080).multithreaded().run();
}
