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

function viewAllEmployees() {
    const sql = 'Select emp.id as EmployeeID, concat(emp.first_name," ",emp.last_name ) as EmployeeName, ro.title as Role_Title, ro.salary as Salary, dept.name as Department_Name, concat(emp2.first_name," ",emp2.last_name) as ManagerName from tracker.employee as emp2 on emp2.id=emp.manager_id left join tracker.Role as ro on emp.role_id left join tracker.department as dep.id = ro.department_id';
    connection.query(
        sql,
        (req, res) => {
            if (err) {
                throw err;
            }
            console.table(res)
            createList();
        }
    )
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name:'department',
            message: 'Add a Department Name:'
        }
    ]).then(answer => {
        console.log(answer);
        connection.query('INSERT INTO department SET?', { name: answer.department }, (err, res) => {
            if (err) throw err;
            console.log('Successfully Added New Department!');
            createList();
        });
    });
}

function addRoles() {
    // Query Departments
    connection.promise().query("SELECT * FROM Department")
        .then((res) => {
            return res[0].map(dept => {
                return {
                    name: dept.name,
                    value: dep.id
                }
            })
        })
        .then((departments) => {
            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'roles',
                    message: 'Add a Role:'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Add a Salary:'
                },
                {
                    type: 'list',
                    name: 'dep',
                    choices: departments,
                    message: 'Select a Department.'
                }
            ])
        })

        .then(answer => {
            console.log(answer);
            return connection.promise().query('INSERT INTO role SET?', { title: answer.roles, salary: answer.salary, department_id: answer.dep });
        })
        .then(res => {
            console.log('New Role Added!');
            createList();
        })
        .catch(err => {
            throw err
        });
}

function selectRole() {
    return connection.promise().query('SELECT * FROM role')
    .then(res => {
        return res[0].map(role => {
            return {
                name: role.title,
                value: role.id
            }
        })
    })
}

function selectManager() {
    return connection.promise().query('SELECT * FROM employee')
    .then(res => {
        return res[0].map(manager => {
            return {
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id
            }
        })
    })
}

async function addEmployees() {
    const managers = await selectManager();

    inquirer.prompt([
        {
            name: 'firstName',
            type: 'input',
            message: 'Enter Employee First Name:'
        },
        {
            name: 'lastName',
            type: 'input',
            message: 'Enter Employee Last Name:'
        },
        {
            name: 'role',
            type: 'list',
            message: 'What is the Role of this Employee?',
            choices: await selectRole()
        },
        {
            name: 'manager',
            type: 'list',
            message: 'Who is the Manager for this Employee?',
            choices: managers
        }
    ]).then(function (res) {
        let idRole = res.role
        let idManager = res.manager

        console.log({idManager});
        connection.query('INSERT INTO Employee SET ?',
        {
            first_name: res.firstName,
            last_name: res.lastName,
            manager_id: idManager,
            role_id: idRole
        },
        function (err) {
            if (err) throw err
            console.table(res)
            createList();
        })
    })
}

function updateEmployeeRole() {
    connection.promise().query('SELECT * FROM employee')
    .then((res) => {
        return res[0].map(employee => {
            return {
                name: employee.first_name,
                value: employee.id
            }
        })
    })
    .then(async (employeeList) => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'employeeListID',
                choices: employeeList,
                message: 'Select the Employee whose Role you wish to Update:'
            },
            {
                type: 'list',
                name: 'idRole',
                choices: await selectRole(),
                message: 'Select the Role of the Employee.'
            }
        ])
    })
    .then(answer => {
        console.log(answer);
        return connection.promise().query('UPDATE employee SET role_id = ? WHERE id = ?',
        [
            answer.idRole,
            answer.employeeListID,
        ],
        );
    })
    .then(res => {
        console.log(res);
        console.log('Successfully Updated Manager!');
        createList();
    })
    .catch(err => {
        throw err
    });
}