#define CROWMAIN

#include <vector>
#include <string>
#include <fstream>
#include <sstream>

#include "crow.h"
#include <crow/json.h>
#include <crow/middlewares/cors.h>
//#include <nlohmann/json.hpp>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>

int main()
{
    //App
    crow::SimpleApp app;
    //Logger for debugging
    app.loglevel(crow::LogLevel::Debug);

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
            
            crow::json::wvalue response;
            response["message"] = "not implemented yet";
            crow::response res(response);
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
      
            std::ifstream file(filePath);
            if (!file.is_open()) {
                res.body = "Error while opening the file";
                return res;
            }

            std::string fileContent((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

            res.set_header("Content-Type", mimeType);
            res.body = fileContent;
            return res;
            });

    //Merge Handler send back data recieved? or fully merged Data
    CROW_ROUTE(app, "/processData")
        .methods("POST"_method)
        ([](const crow::request& req) {
            // Parse JSON data from the request body
            crow::json::rvalue data2Combine;
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

            // Aggregate data and send back a single response
            //Data should be a .ply or .xyz file need further understanding how to do this
            crow::json::wvalue combinedData;
            combinedData["message"] = "Data processed successfully";
            combinedData["status"] = "success";

            crow::response res(combinedData);

            res.add_header("Access-Control-Allow-Origin", "*"); // Set CORS header
            res.add_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type");

            //CROW_LOG_INFO << "Response: " << res.;

            return res;
            });

    //Pre Cors Handler 
    CROW_ROUTE(app, "/processData").methods("OPTIONS"_method)
        ([](const crow::request& req) {
            crow::response res;

            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type");

      

            return res;
            });

      
    app.port(18080).multithreaded().run();
}
