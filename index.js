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
                // 'View Employee by Manager',
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

                // case "View Employee By Manager":
                //     viewEmployeeByManager();
                //     break;

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
    // const sql = 'SELECT * FROM tracker.employee';
    const sql = 'SELECT emp.id AS Employee_Id, CONCAT(emp.first_name," ",emp.last_name ) AS Employee_Name, ro.title AS Role_Title, ro.salary AS Salary, dep.name AS Department_Name, CONCAT(emp2.first_name," ",emp2.last_name) AS Manager_Name FROM tracker.employee AS emp LEFT JOIN tracker.employee AS emp2 ON emp.manager_id = emp2.id LEFT JOIN tracker.Role AS ro ON emp.role_id = ro.id LEFT JOIN tracker.department AS dep ON ro.dep_id = dep.id';
    connection.query(
        sql,
        (err, res) => {
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
                    value: dept.id
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
            return connection.promise().query('INSERT INTO role SET?', { title: answer.roles, salary: answer.salary, dep_id: answer.dep });
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
        console.log('Successfully Updated Employee!');
        createList();
    })
    .catch(err => {
        throw err
    });
}

function updateEmployeeManager() {
    connection.promise().query('SELECT * FROM employee')
    .then((res) => {
        // Department Array
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
                message: 'Select the Employee to whom you wish to assign a Manager:'
            },
            {
                type: 'list',
                name: 'managerID',
                choices: await selectManager(),
                message: 'Select the Employee to whom you wish to make a Manager.'
            }
        ])
    })
    .then(answer => {
        console.log(answer);
        return connection.promise().query('UPDATE employee SET manager_id = ? WHERE id =?',
        
        [
            answer.managerID,
            answer.employeeListID
        ],
        );
    })
    .then(res => {
        console.log(res);
        console.log('Successfully Updated Manager!');
        createList();
    });
}

function deleteEmployee() {
    connection.promise().query('SELECT * FROM employee')
        .then((res) => {
            // Create Employee Array
            return res[0].map(emp => {
                return {
                    name: emp.first_name,
                    value: emp.id
                }
            })
        })
        .then((employees) => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'idEmployee',
                    choices: employees,
                    message: 'Select the Employee you wish to Delete.'
                }
            ])
        })
        .then(answer => {
            console.log(answer);
            return connection.promise().query('DELETE FROM Employee WHERE id = ?', answer.idEmployee);
        })
        .then(res => {
            console.log('Successfully Deleted Target Employee!');
            createList();
        })
        .catch(err => {
            throw err
        });
}

function deleteDepartment() {
    connection.promise().query('SELECT * FROM Department')
    .then((res) => {
        // Department Array for Choice
        return res[0].map(dep => {
            return {
            name: dep.name,
            value: dep.id
            }
        })
    })
    .then((departments) => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'depId',
                choices: departments,
                message: 'Select Which Department You Wish to Delete.'
            }
        ])
    })
    .then(answer => {
        console.log(answer);
        return connection.promise().query('DELETE FROM Department WHERE id = ?', answer.depId);
    })
    .then(res => {
        console.log(res);
        console.log('Department Successfully Deleted!');
        createList();
    })
    .catch(err => {
        throw err
    });
}

function deleteRole() {
    connection.promise().query('SELECT title, id FROM role')
        .then((res) => {
            // Role Array
            return res[0].map(roles => {
                return {
                    name: roles.title,
                    value: roles.id
                }
            })
        })
        .then((employeeRole) => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'idRole',
                    choices: employeeRole,
                    message: 'Select the Role you wish to delete.'
                }
            ])
        })
        .then(answer => {
            console.log(answer);
            return connection.promise().query('DELETE FROM Role WHERE id = ?', answer.idRole);
        })
        .then((res) => {
            console.log(res);
            console.log('Successfully Deleted Target Role');
            createList();
        })
        .catch(err => {
            throw err
        });
}

// function viewEmployeeByManager() {
//     connection.promise().query('SELECT * FROM employee')
//     .then ((res) => {
//         // Create Array
//         return res[0].map(employee => {
//             return {
//                 name: employee.firstName,
//                 value: employee.id
//             }
//         })
//     })
//     .then (async (managerList) => {
//         return inquirer.prompt([
//             {
//                 type: 'list',
//                 name: 'idManager',
//                 choices: managerList,
//                 message: 'Select the Manager whose Employees you wish to view.'
//             }
//         ])
//     })
//     .then(answer => {
//         console.log(answer);
//         return connection.promise().query('SELECT * FROM employee WHERE manager_id = ?', answer.idManager);
//     })
//     .then(res => {
//         console.table(res[0]);
//         createList();
//     })
//     .catch(err => {
//         throw err
//     });
// }

createList();

