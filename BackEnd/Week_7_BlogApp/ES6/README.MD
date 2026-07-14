1- index.js
2- npm init -y
3- npm i express
4- package.json => "type":"module"
5- package.json => "scripts": {"dev": "node --watch index.js"}
6- folder src
7- src/app.controller.js   >>> application start function
8- src/app.controller.js   >>> creat bootstrap function and export 
9- import bootstrap in index.js
10- src/module/auth => auth.controller.js & folder services => registration.service.js
11- import service inside auth.controller.js 
12- import auth.controller.js inside app.controller.js using app.use(/auth ,[import])
