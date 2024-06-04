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

	//Export 3D Data conversion Handler
	CROW_ROUTE(app, "/export")
		.methods("POST"_method)
		([](const crow::request& req) {
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

	//Get request for merged Data
	CROW_ROUTE(app, "/mergedData")
		([&]() {
		//The Content type differs for xyz, ply or stl (for testing purposes its allways "application/octet-stream")
		std::string mimeType = "chemical/x-xyz";

		//Filepath might be needed if we temporarily store all merged data
		std::string filePath = "C:\\Users\\tn\\source\\repos\\team-5-cloud-processing-gfai-3d-datenverarbeitung\\Models\\beethoven_2.xyz";

		//Crow response initialisation
		crow::response res;

		//Testing filepath
		std::ifstream file(filePath);
		if (!file.is_open()) {
			res.body = "Error while opening the file";
			return res;
		}
		//reading Filepath
		std::string fileContent((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

		//Setting up Response
		res.set_header("Content-Type", mimeType);

		//Headers:
		res.add_header("Access-Control-Allow-Origin", "http://localhost:5173");

		res.body = fileContent;
		return res;
			});

	//Merge Handler send back data recieved? or fully merged Data
	CROW_ROUTE(app, "/processData")
		.methods("POST"_method)
		([](const crow::request& req) {
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
	CROW_ROUTE(app, "/processData").methods("OPTIONS"_method)
		([](const crow::request& req) {
		crow::response res;

		//Headers:
		res.add_header("Access-Control-Allow-Origin", "http://localhost:5173");

		return res;
			});

	//Starts the server
	app.port(18080).multithreaded().run();
}
