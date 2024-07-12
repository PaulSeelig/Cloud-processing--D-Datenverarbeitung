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

#include <pcl/filters/voxel_grid.h>
#include <pcl/filters/filter.h>
#include <pcl/features/normal_3d.h>

#include <pcl/registration/icp.h> 
#include <pcl/registration/icp_nl.h>
#include <pcl/registration/transforms.h>
#include <pcl/registration/transformation_estimation_svd.h>

#include <pcl/io/pcd_io.h>
#include <pcl/io/ply_io.h>
#include <pcl/io/vtk_io.h>
//#include <pcl/io/vtk_lib_io.h> //this needs the vtk library and just leads to errors

// Define a new point representation for < x, y, z, curvature >
//This is needed for a better icp that takes the surface of the object into account
class MyPointRepresentation : public pcl::PointRepresentation<pcl::PointNormal>
{
	using pcl::PointRepresentation<pcl::PointNormal>::nr_dimensions_;
public:
	MyPointRepresentation()
	{
		nr_dimensions_ = 4;
	}

	virtual void copyToFloatArray(const pcl::PointNormal& p, float* out) const
	{
		out[0] = p.x;
		out[1] = p.y;
		out[2] = p.z;
		out[3] = p.curvature;
	}
};

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

//Saves the incoming content to a file 
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
	std::unordered_map<std::string, pcl::PointCloud<pcl::PointXYZ>::Ptr> pcMap;

	//Output pointcloud
	pcl::PointCloud<pcl::PointXYZ>::Ptr final_points(new pcl::PointCloud<pcl::PointXYZ>);

	//Importing and saving the recieved Data in Pointclouds
	CROW_ROUTE(app, "/Import3dScan").methods(crow::HTTPMethod::Post)(
		[URL, &pcMap](const crow::request& req)
		{
			crow::multipart::message msg(req);

			crow::response res;
			res.add_header("Access-Control-Allow-Origin", URL);

			std::string fileType = msg.parts[1].body;
			std::string fileName = msg.parts[2].body;
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

				pcMap[fileName] = cloud;

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
				pcMap[fileName] = cloud;
				std::remove(filePath.c_str());
			}

			if (!pcMap.empty() && pcMap.find(fileName) != pcMap.end())
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

	//Delete Handler to delete the saved point cloud
	CROW_ROUTE(app, "/delete3DFile").methods(crow::HTTPMethod::Post)
		([&pcMap, URL](const crow::request& req)
			{
				crow::response res;
				res.add_header("Access-Control-Allow-Origin", URL);

				//Key to find and delete inside the has map
				std::string key;

				try {
					key = req.body;
				}
				catch (const std::exception& e) {
					res.code = 400;
					res.body = "Object was not a String";
					return res;
				}

				try {
					key = receivedKey[0].s();
				}
				catch (const std::exception& e) {
					res.code = 400;
					res.write("Invalid key");
					return res;
				}

				if (key == "*") {
					// Clear the entire map
					pcMap.clear();

					// Check if the map is empty and send back the appropriate response
					if (pcMap.empty()) {
						res.code = 200;
						res.body = "All Point Clouds have been deleted";
					}
					else {
						res.code = 400;
						res.body = "Error while deleting all Point Clouds";
					}
					return res;
				}

				auto it = pcMap.find(key);
				if (it == pcMap.end()) {
					res.code = 400;
					res.body = "Key not found";
					return res;
				}

				// Erase the element with the given key
				pcMap.erase(it);

				// Checks if deleting was successful and sends back the appropriate response
				if (pcMap.find(key) == pcMap.end()) {
					res.code = 200;
					res.body = "Point Cloud has been deleted";
				}
				else {
					res.code = 400;
					res.body = "Error while deleting";
				}
				return res;
			});


	//ICP Handler sends back a 4x4 transformation Matrix
	CROW_ROUTE(app, "/mergeImportedFiles").methods("POST"_method)
		([URL, &pcMap, final_points](const crow::request& req) {
		
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
			auto& matrixArray = receivedData["matrix"];
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
			pcl::PointCloud<pcl::PointXYZ>::Ptr sor_cloud(new pcl::PointCloud<pcl::PointXYZ>);
			pcl::PointCloud<pcl::PointXYZ>::Ptr tar_cloud(new pcl::PointCloud<pcl::PointXYZ>);

			//To help with downsizing the files
			pcl::VoxelGrid<pcl::PointXYZ> grid;

			////With large datasets its easier to downsize
			//grid.setLeafSize(0.05f, 0.05f, 0.05f);
			//grid.setInputCloud(pcList.back());
			//grid.filter(*sor_cloud);

			//grid.setInputCloud(pcList.front());
			//grid.filter(*tar_cloud);

			try {
				// Retrieve the point clouds from the map using the keys
				sor_cloud = pcMap.at(receivedData["fileName2"].s());
				tar_cloud = pcMap.at(receivedData["fileName1"].s());
			}
			catch (const std::out_of_range& e) {
				// Handle the case where the key is not found
				res.code = 404;
				res.body = "Key not found in map";
				return res;
			}

			//Applying initial guess to source cloud
			pcl::transformPointCloud(*sor_cloud, *sor_cloud, transformation);

			//Verifying the validity of Pointclouds
			if (sor_cloud->empty() || tar_cloud->empty()) {
				res.code = 400;
				res.body = "One of the Pointclouds was empty!";
				return res;
			}

			// Compute surface normals and curvature
			pcl::PointCloud<pcl::PointNormal>::Ptr points_with_normals_src(new pcl::PointCloud<pcl::PointNormal>);
			pcl::PointCloud<pcl::PointNormal>::Ptr points_with_normals_tgt(new pcl::PointCloud<pcl::PointNormal>);

			pcl::NormalEstimation<pcl::PointXYZ, pcl::PointNormal> norm_est;
			pcl::search::KdTree<pcl::PointXYZ>::Ptr tree(new pcl::search::KdTree<pcl::PointXYZ>);
			norm_est.setSearchMethod(tree);
			norm_est.setKSearch(30);

			norm_est.setInputCloud(sor_cloud);
			norm_est.compute(*points_with_normals_src); //now this shit fails here
			pcl::copyPointCloud(*sor_cloud, *points_with_normals_src);

			norm_est.setInputCloud(tar_cloud);
			norm_est.compute(*points_with_normals_tgt);
			pcl::copyPointCloud(*tar_cloud, *points_with_normals_tgt);

			// Instantiate custom point representation (defined above)
			MyPointRepresentation point_representation;
			float alpha[4] = { 1.0f, 1.0f, 1.0f, 1.0f };
			point_representation.setRescaleValues(alpha);

			// Align with surface normals and curveature 
			pcl::IterativeClosestPointNonLinear<pcl::PointNormal, pcl::PointNormal> reg;
			reg.setTransformationEpsilon(1e-6);
			reg.setMaxCorrespondenceDistance(0.1);  // 10 cm
			//sets icp to understand curvature
			reg.setPointRepresentation(std::make_shared<const MyPointRepresentation>(point_representation));
			//Inputs both clouds
			reg.setInputSource(points_with_normals_src);
			reg.setInputTarget(points_with_normals_tgt);

			Eigen::Matrix4f Ti = Eigen::Matrix4f::Identity(), prev, targetToSource;
			pcl::PointCloud<pcl::PointNormal>::Ptr reg_result = points_with_normals_src;
			reg.setMaximumIterations(2);

			for (int i = 0; i < 30; ++i)
			{
				points_with_normals_src = reg_result;
				reg.setInputSource(points_with_normals_src);
				reg.align(*reg_result);

				Ti = reg.getFinalTransformation() * Ti;

				if (fabs((reg.getLastIncrementalTransformation() - prev).sum()) < reg.getTransformationEpsilon())
					reg.setMaxCorrespondenceDistance(reg.getMaxCorrespondenceDistance() - 0.001);

				prev = reg.getLastIncrementalTransformation();
			}
			//Crow response
			crow::json::wvalue JSONres;
			res.add_header("Content-Type", "application/json");

			if (reg.hasConverged())
			{
				JSONres["matrix"] = matrixToJson(targetToSource);
				res.body = JSONres.dump();
				res.code = 200;
			}
			else
			{
				res.body = "icp did not converge";
				res.code = 400;
			}
			return res;
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
