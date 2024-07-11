#define CROWMAIN

#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <iostream>
#include <filesystem>
#include <list>

//The Crow relevent headers
#include "crow.h" //this needs to be replaced when using Linux to #include "crow_all.h"
//#include "crow_all.h"
#include <crow/json.h>
#include <crow/multipart.h>
#include <crow/middlewares/cors.h>

//The PCL relevant headers
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl/PolygonMesh.h>

#include <pcl/registration/icp.h> 
#include <pcl/registration/icp_nl.h>
#include <pcl/registration/transformation_estimation_svd.h>

#include <pcl/io/pcd_io.h>
#include <pcl/io/ply_io.h>
#include <pcl/io/vtk_io.h>
//#include <pcl/io/vtk_lib_io.h> //this needs the vtk library and just leads to errors

crow::json::wvalue::list matrixToJson(pcl::registration::TransformationEstimationSVD<pcl::PointXYZ, pcl::PointXYZ>::Matrix4 transformation)
{
	//response transformation matrix
	crow::json::wvalue json_matrix;
	crow::json::wvalue::list matrix_array;

	//4x4 matrix -> json object
	for (int i = 0; i < 4; ++i) {
		for (int j = 0; j < 4; ++j) {
			matrix_array.push_back(transformation(i, j));
		}
	}

	return matrix_array;
}

void saveFile(const std::string& filePath, bool isBinary, std::string& fileContent)
{
	std::ofstream outFile;
	if (isBinary)
	{
		outFile.open(filePath, std::ios::binary);
	}
	else
	{
		outFile.open(filePath);
	}

	outFile.write(fileContent.c_str(), fileContent.size());
	outFile.close();
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
	std::list<pcl::PointCloud<pcl::PointXYZ>::Ptr> pcList;

	//Output pointcloud
	pcl::PointCloud<pcl::PointXYZ>::Ptr final_points(new pcl::PointCloud<pcl::PointXYZ>);

	

	CROW_ROUTE(app, "/Import3dScan").methods(crow::HTTPMethod::Post)(
		[URL, &pcList](const crow::request& req)
		{
			crow::multipart::message msg(req);

			crow::response res;
			res.add_header("Access-Control-Allow-Origin", URL);

			std::string fileType = msg.parts[1].body;
			std::string fileContent = msg.parts[0].body;
			std::string filePath;

			// Initialize the point cloud
			pcl::PointCloud<pcl::PointXYZ>::Ptr cloud(new pcl::PointCloud<pcl::PointXYZ>);

			// This saves ply Files
			if (fileType == ".ply")
			{
				filePath = "scan_output.ply";
				// Save the received data as a .ply file
				saveFile(filePath, true, fileContent);


				pcl::io::loadPLYFile(filePath, *cloud);

				pcList.push_back(cloud);

				std::remove(filePath.c_str());

			}
			if (fileType == ".stl")
			{
				filePath = "scan_output.stl";
				// Save the received data as a .ply file
				saveFile(filePath, true, fileContent);

				pcl::PolygonMesh mesh;


				std::remove(filePath.c_str());

			}
			if (fileType == ".xyz")
			{
				filePath = "scan_output.xyz";
				saveFile(filePath, false, fileContent);

				std::ifstream inFile(filePath);
				if (!inFile) {
					std::remove(filePath.c_str());
					return crow::response(500, "Failed to open XYZ file for reading");
				}

				std::string line;
				while (std::getline(inFile, line))
				{
					// Skip comment lines or empty lines
					if (line.empty() || line[0] == '#')
					{
						continue;
					}

					std::istringstream iss(line);
					pcl::PointXYZ point;
					std::cout << "Reading line: " << line << std::endl;
					if (!(iss >> point.x >> point.y >> point.z))
					{
						std::remove(filePath.c_str());
						return crow::response(500, "Failed to parse XYZ file");
					}
					cloud->points.push_back(point);
				}
				cloud->width = cloud->points.size();
				cloud->height = 1;
				cloud->is_dense = true;

				inFile.close();
				pcList.push_back(cloud);
				std::remove(filePath.c_str());
			}

			if (!pcList.empty() && pcList.back() == cloud)
			{
				res.body = "File uploaded succesfully";
				res.code = 200;
			}
			else
			{
				res.body = "File upload failed";
				res.code = 400;
			}
			return res;
		});


	//Delete Handler to delete saved point clouds
	CROW_ROUTE(app, "/delete3DFile").methods(crow::HTTPMethod::Post)
		([pcList](const crow::request& req)
			{
				
				int fileIndex = stoi(req.body);

				//clear the saved Data possible PCD
				
				//checks if deleting was succesful and sends back the appropriete response
				if (true) {
					return crow::response("Point Clouds have been deleted");
				}
				else {
					return crow::response("Error while deleting");
				}
			});

	//ICP Handler sends back a 4x4 transformation Matrix
	CROW_ROUTE(app, "/mergeImportedFiles").methods("POST"_method)
		([URL, &pcList, final_points](const crow::request& req) {
		
		// JSON store object
		crow::json::rvalue receivedData;

		// Crow response
		crow::response res;
		// Headers:
		res.add_header("Access-Control-Allow-Origin", URL);

		// Crow JSON return object
		crow::json::wvalue response;
		
		// Test to see if it's a JSON object
		try {
			receivedData = crow::json::load(req.body);
			if (!receivedData) {
				res.code = 400;
				res.body = "Object was not a JSON";
				return res;
			}
		}
		catch (const std::exception& e) {
			return crow::response(400, e.what());
		}

		// The 4x4 Matrix that was last applied to the data set, This is the initial guess later used
		pcl::registration::TransformationEstimationSVD<pcl::PointXYZ, pcl::PointXYZ>::Matrix4 transformation;

		// Extracting the 4x4 Matrix from JSON Object
		auto& matrixArray = receivedData;
		int i = 0;

		// Iterate over the 4x4 matrix in receivedData
		for (int j = 0; j < 4; j++) {
			for (int k = 0; k < 4; k++) {
				// Filling the transformation matrix
				transformation(j, k) = matrixArray[i].d();
				i++;
			}
		}

		// Dereferencing the Pointclouds inside the Pointcloud List
		pcl::PointCloud<pcl::PointXYZ>::Ptr sor_cloud = pcList.front();
		pcl::PointCloud<pcl::PointXYZ>::Ptr tar_cloud = pcList.back();

		//Verifying the validity of Pointclouds
		if (sor_cloud->empty() || tar_cloud->empty()) {
			res.code = 400;
			res.body = "One of the Pointclouds was empty!";
		}

		// Initialize ICP Non-Linear and set parameters
		pcl::IterativeClosestPointNonLinear<pcl::PointXYZ, pcl::PointXYZ> icp_nl;

		//no idea what this does
		icp_nl.setTransformationEpsilon(1e-6);

		//This might need to change to be variable
		icp_nl.setMaxCorrespondenceDistance(0.1); 

		icp_nl.setInputSource(sor_cloud);
		icp_nl.setInputTarget(tar_cloud);

		// Also might be needed
		// icp_nl.setMaximumIterations(100); 

		// Align the point clouds
		try {
			icp_nl.align(*final_points, transformation);

			// Check if the ICP worked
			if (icp_nl.hasConverged()) 
			{
				response["matrix"] = std::move(matrixToJson(icp_nl.getFinalTransformation()));
				res.body = response.dump();
			}
			else {
				// In case it didn't work
				res.body = "ICP did not converge";
			}

			return res;
		}
		catch (const std::exception& e) {
			return crow::response(400, e.what());
		}
		
			});


	//Pointpicking Handler sends back a 4x4 transformation Matrix
	CROW_ROUTE(app, "/pointsPicked").methods(crow::HTTPMethod::POST)
		([URL](const crow::request& req)
			{
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
				
				//Crow response
				crow::json::wvalue JSONres;
				JSONres["matrix"] = matrixToJson(transformation);
				res.body = JSONres.dump();
				res.code = 200;
				res.add_header("Content-Type", "application/json");

				return res;
			});

	//Starts the server
	app.port(18080).multithreaded().run();
}
