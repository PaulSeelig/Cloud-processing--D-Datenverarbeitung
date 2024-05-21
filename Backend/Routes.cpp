#define CROWMAIN

#include "crow.h"
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>


//Hello World
int main()
{
    // Example Crow server setup
    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([]() {
        return "Hello, world!";
        });

    app.port(18080).multithreaded().run();
}