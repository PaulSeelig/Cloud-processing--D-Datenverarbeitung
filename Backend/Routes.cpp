#define CROWMAIN

#include <vector>
#include <string>

#include "crow.h"
#include <crow/json.h>
#include <nlohmann/json.hpp>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>


int main()
{
    // Example Crow server setup
    crow::SimpleApp app;

    CROW_ROUTE(app, "/filenames")
        ([]() {
        // Process the request and return JSON data
        std::string resp = "Do be working?";
        crow::json::wvalue responce;
        responce.dump();

        return responce;
            });

    app.port(18080).multithreaded().run();
}