const inquirer = require('inquirer');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'tracker',
});

connection.connect();

function createList() {
    inquirer.prompt(
        {
            type: 'list',
            message: 'What Would You Like To Do?',
            name: 'option',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add Department',
                'Add Roles',
                'Add Employees',
                'Delete Department(s)',
                'Delete Role(s)',
                'Delete Employee(s)',
                'Update Employee Roles',
                'Update Employee Manager',
                'View Employee by Manager',
                'Exit'
            ]
        }).then(answer => {
            switch (answer.option) {
                case "View All Departments":
                    viewAllDepartments();
                    break;

                case "View All Roles":
                    viewAllRoles();
                    break;
                
                case "View All Employees":
                    viewAllEmployees();
                    break;
                
                case "Add Department":
                    addDepartment();
                    break;

                case "Add Roles":
                    addRoles();
                    break;

                case "Add Employees":
                    addEmployees();
                    break;

                case "Delete Department(s)":
                    deleteDepartment();
                    break;

                case "Delete Role(s)":
                    deleteRole();
                    break;

                case "Delete Employee(s)":
                    deleteEmployee();
                    break;

                case "Update Employee Roles":
                    updateEmployeeRole();
                    break;

                case "Update Employee Manager":
                    updateEmployeeManager();
                    break;

                case "View Employee By Manager":
                    viewEmployeeByManager();
                    break;

                case "Exit":
                    connection.end();
                    console.log('Have A Shiny Day!');
                    break;



            }
        })
}

function viewAllDepartments() {
    connection.query(
        'SELECT * FROM Department', (err, res) => {
            if (err) {
                throw err;
            }
            console.table(res)
            createList();
        }
    )
}

function viewAllRoles() {
    connection.query(
        'SELECT ro.title as Role_Title, ro.salary as Salary, dept.name as DepartmentName from Role ro left join Department as dept on dept.id = ro.dep_id', (err, res) => {
        if (err) {
            throw err;
        }
        console.table(res)
        createList();
      }  
    )
}