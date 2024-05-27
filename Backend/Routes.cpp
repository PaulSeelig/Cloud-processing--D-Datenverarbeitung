#define CROWMAIN

#include <vector>
#include <string>

#include "crow.h"
#include <crow/json.h>
#include <crow/middlewares/cors.h>
//#include <nlohmann/json.hpp>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>

int main()
{
    crow::SimpleApp app;

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
        return res;
            });


    app.port(18080).multithreaded().run();
}
