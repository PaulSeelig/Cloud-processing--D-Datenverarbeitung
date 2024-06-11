# Cloud Processing


[wip]

## Installation
###Back-end
for Windows:
1. vcpkg for [Windows](https://github.com/microsoft/vcpkg?tab=readme-ov-file#quick-start-windows)
2. .\vcpkg install Crow
3. .\vcpkg install pcl
4. start in visual studio 2022

for Linux: 
1. run git clone https://github.com/CrowCpp/Crow.git
2. run $ sudo apt install libpcl-dev (Ubuntu/Debian)
3. bash: /my_crow_project
            /src
                main.cpp
            /include
4. cp Crow/amalgamate/crow_all.h my_crow_project/include/
5. replace the "crow.h" header to "crow_all.h" inside the backend.cpp


###Front-End

1. install [Node.js](https://nodejs.org/en)
2. open command line -->

> npm install --save three

> npm install --save-dev vite

3. start in visual studio 2022