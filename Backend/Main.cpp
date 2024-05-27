#include "crow.h"
#define CROWMAIN;

int main()
{
	crow::SimpleApp app;

	CROW_ROUTE(app, '/')([]() {
		return "Hello world!";
	});

	app.port(5000).run();
}