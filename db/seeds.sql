USE tracker;

INSERT INTO Department (name)
VALUES ('Sales'),
        ('Engineering'),
        ('Finance'),
        ('Legal');

INSERT INTO Role
    (title, salary, dep_id)
VALUES 
    ('Sales Manager', 100000, 1),
    ('Sales Rep', 75000, 1),

    ('Software Engineer', 130000, 2),
    ('Structural Engineer', 125000, 2),

    ('Accounts Manager', 145000, 3),
    ('Accountant', 110000, 3),

    ('Lead Legal Advisor', 165000, 4),
    ('Lawyer', 155000, 4);

INSERT INTO Employee
    (first_name, last_name, r_id, m_id)
VALUES
    ('Rob', 'Burson', 1, NULL),
    ('Hunter', 'Hughes', 2, 1),
    ('Paul', 'Diaz', 3, NULL),
    ('Jessica', 'Diaz', 4, 3),
    ('Chuck', 'Hunter', 5, NULL),
    ('Jerry', 'Robertson', 6, 5),
    ('Labaren', 'Holland', 7, NULL),
    ('Hunter', 'Smith', 8, 7);
