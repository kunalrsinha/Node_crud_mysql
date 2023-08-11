const mysql = require('mysql');
const express = require('express')
const bcrypt = require('bcrypt')
const saltLimit = 10;
const app = express();
const bp = require('body-parser');
app.use(bp.json());

const port = 3200;

var mysqlConnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodecrud_db'
})

mysqlConnect.connect((err) => {
    if (!err)
        console.log("Db connected successfully")
    else
        console.log("Db Connectioon Error", err)
})


app.get('/', (req, res) => {
    res.send("Hello");
})


// get all employee records from employee table
app.get('/employee_list', (req, res) => {
    var qry = `Select * From employee order by id desc`;
    mysqlConnect.query(qry, (err, rows, field) => {
        if (!err) {
            // console.log("Employee records are here",rows)
            res.send(rows);
        }
        else
            console.log('Error while fetching employee', err)
    })
})

// get single employee record from employee table
app.get('/employee_list/:id', (req, resp) => {
    var qry = `Select * From employee where id=${req.params.id}`
    mysqlConnect.query(qry, (err, row, field) => {
        if (!err)
            resp.send(row)
        else
            console.log("User not found", err);
    })
})


// insert employee record
app.post('/employee_list', async (req, resp) => {
    var inputData = req.body;
    let name = inputData.name;
    let email = inputData.email;
    let password = inputData.password;
    let mobile = inputData.mobile;
    let status = inputData.status;
    let cdate = new Date();
    let year = cdate.getFullYear();
    let month = cdate.getMonth() + 1;
    let day = cdate.getDate();
    let addedDate = `${year}-${month}-${day}`;
    // console.log("final date",addedDate);
    let newpass = await bcrypt.hash(password, saltLimit)
    var qry1 = `Select * From employee where email="${email}"`;
    var result = mysqlConnect.query(qry1, (err1, row) => {
        console.log("row",row)
        if (row.length==0) {
            var qry = `Insert into employee(name,email,password,mobile,status,date) VALUES ("${name}","${email}","${newpass}",${mobile},"${status}","${addedDate}")`
            mysqlConnect.query(qry, (err, row) => {
                if (!err)
                resp.send("Employee Added Successfully")
                else
                resp.send("Something Went Wrong")
            })
        }
        else{
            resp.send("Email already Exist")
        }
    })
})

// update user information
app.put('/employee_list/:id',async(req,res)=>{
    let id = req.params.id;
    let bodyData = req.body;
    let name = bodyData.name;
    let mobile = bodyData.mobile;
    let status = bodyData.status;
    let qry = `SELECT * FROM employee where id=${id}`;
    mysqlConnect.query(qry,(err,row)=>{
        if(row.length==0)
        res.send('User not found');
        else{
            if(name == "" || name==null)
            name = row[0].name;
            if(mobile=="" || mobile==null)
            mobile = row[0].mobile;
            if(status=="" || status==null)
            status = row[0].status;
            let qry1 = `UPDATE employee SET name="${name}",mobile="${mobile}",status="${status}" WHERE id=${id}`;
            mysqlConnect.query(qry1,(err,row)=>{
                if(!err)
                res.send("User Updated sucessfully");
                else
                res.send('Something Went wrong' + err)
            })
        }
    })
})


// delete a user
app.delete('/employee_list/:id',(req,res)=>{
    let id = req.params.id;
    let qry = `SELECT * FROM employee where id = ${id}`
    mysqlConnect.query(qry,(err,row)=>{
        if(row.length==0 || row.length==null)
        res.send("User not found")
        else{
            let qry1 = `Delete From employee where id=${id}`;
            mysqlConnect.query(qry1,(err1,row)=>{
                if(!err1)
                res.send('User removed successfully');
                else
                res.send('Something went wrong' + err1);
            })
        }
    })
})


app.listen(port, (err) => {
    if (!err)
        console.log("Server is runnong on port" + port)
    else
        console.log("Error in connection", err)
})

