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
		([](const crow::request& req)
		{
				return crow::response(400, "Not implemented yet");
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
			// Parse JSON data from the request body
			crow::json::rvalue data2Combine;

			//Test if the send object is a Json Obj
			try {
				data2Combine = crow::json::load(req.body);
			}
			catch (const std::exception& e) {
				return crow::response(400);
			}

			// Process the received data
			//split into file 1, file 2, file 1 points picked and file 2 points picked (or points picked are one file?)
			std::cout << "Received data 1: " << data2Combine["data1"].s() << std::endl;
			std::cout << "Received data 2: " << data2Combine["data2"].s() << std::endl;
			std::cout << "Received data 3: " << data2Combine["data3"].s() << std::endl;

			//initialize data and send back a single response
			//Data should be a .ply or .xyz file need further understanding how to do this
			crow::json::wvalue combinedData;
			combinedData["message"] = "Data processed successfully";
			combinedData["status"] = "success";

			//Initialize Response
			crow::response res(combinedData);

			//Headers:
			res.add_header("Access-Control-Allow-Origin", "http://localhost:5173");

			return res;
		});

	//Pre Cors Handler needed for the Post request
	CROW_ROUTE(app, "/processData").methods(crow::HTTPMethod::OPTIONS)
		([](const crow::request& req) 
		{
			crow::response res;

			//Headers:
			res.add_header("Access-Control-Allow-Origin", "http://localhost:5173");

			return res;
		});

	//Starts the server
	app.port(18080).multithreaded().run();
}
