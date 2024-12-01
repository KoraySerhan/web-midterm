document.addEventListener("DOMContentLoaded", () => {
    const courses = [];
    const students = [];

    // Menu buttons functionality
    const menuButtons = document.querySelectorAll(".menu-btn");
    const sections = document.querySelectorAll("section");

    menuButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetSection = button.getAttribute("data-section");
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.remove("hidden");
                } else if (section.id !== "main-menu") {
                    section.classList.add("hidden");
                }
            });
        });
    });

    // Add course functionality
    document.getElementById("add-course-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const courseName = document.getElementById("course-name").value.trim();
        const gradingScale = document.getElementById("grading-scale").value.trim();

        if (courseName && gradingScale) {
            const gradeBoundaries = parseGradingScale(gradingScale);
            courses.push({ name: courseName, gradeBoundaries });
            updateCourseDropdown();
            alert(`Course "${courseName}" added successfully!`);
            e.target.reset();
        }
    });

    // Parse grading scale from user input
    function parseGradingScale(scale) {
        const boundaries = {};
        const grades = scale.split(",").map(item => item.trim());
        grades.forEach(gradeRange => {
            const [grade, range] = gradeRange.split(":");
            const [min, max] = range.split("-").map(Number);
            boundaries[grade.trim()] = { min, max };
        });
        return boundaries;
    }

    // Calculate letter grade based on grading scale
    function calculateGrade(midterm, final, gradeBoundaries) {
        const score = (midterm * 0.4 + final * 0.6) / 2;
        for (let [grade, { min, max }] of Object.entries(gradeBoundaries)) {
            if (score >= min && score <= max) return grade;
        }
        return "F"; // Default grade if no match
    }

    // Add student functionality
    document.getElementById("add-student-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const courseIndex = document.getElementById("course-select").value;
        if (courseIndex === "") {
            alert("Please select a course first.");
            return;
        }

        const student = {
            id: document.getElementById("student-id").value.trim(),
            name: document.getElementById("student-name").value.trim(),
            surname: document.getElementById("student-surname").value.trim(),
            courses: [
                {
                    course: courses[courseIndex].name,
                    midterm: parseFloat(document.getElementById("midterm-score").value),
                    final: parseFloat(document.getElementById("final-score").value),
                    grade: calculateGrade(
                        parseFloat(document.getElementById("midterm-score").value),
                        parseFloat(document.getElementById("final-score").value),
                        courses[courseIndex].gradeBoundaries
                    )
                }
            ]
        };

        let existingStudent = students.find(s => s.id === student.id);
        if (existingStudent) {
            existingStudent.courses.push(student.courses[0]);
        } else {
            students.push(student);
        }

        updateStudentTable(courses[courseIndex].name);
        alert(`Student "${student.name} ${student.surname}" added successfully!`);
        e.target.reset();
    });

    // Update course dropdown
    function updateCourseDropdown() {
        const courseSelect = document.getElementById("course-select");
        courseSelect.innerHTML = "<option value=''>-- Select a Course --</option>";
        courses.forEach((course, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
    }

    // Update student table and add delete functionality
    function updateStudentTable(courseName) {
        const studentTable = document.getElementById("student-table").getElementsByTagName("tbody")[0];
        studentTable.innerHTML = "";
        students.forEach(student => {
            student.courses.forEach(course => {
                if (course.course === courseName) {
                    const row = studentTable.insertRow();
                    row.innerHTML = `
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td>${student.surname}</td>
                        <td>${course.midterm}</td>
                        <td>${course.final}</td>
                        <td>${course.grade}</td>
                        <td><button class="delete-btn">Delete</button></td>
                    `;

                    // Add event listener for the delete button
                    const deleteBtn = row.querySelector(".delete-btn");
                    deleteBtn.addEventListener("click", () => {
                        deleteStudent(student.id, courseName);
                        row.remove();
                    });
                }
            });
        });
    }

    // Delete student from the students array
    function deleteStudent(studentId, courseName) {
        const studentIndex = students.findIndex(student => student.id === studentId);
        if (studentIndex !== -1) {
            const courseIndex = students[studentIndex].courses.findIndex(course => course.course === courseName);
            if (courseIndex !== -1) {
                students[studentIndex].courses.splice(courseIndex, 1);
            }

            if (students[studentIndex].courses.length === 0) {
                students.splice(studentIndex, 1);
            }

            alert(`Student with ID "${studentId}" has been removed from the course "${courseName}".`);
        }
    }

    // Filter functionality
    document.getElementById("view-passed").addEventListener("click", () => {
        const courseIndex = document.getElementById("course-select").value;
        if (courseIndex === "") {
            alert("Please select a course first.");
            return;
        }

        const courseName = courses[courseIndex].name;

        const passedStudents = students.filter(student =>
            student.courses.some(course =>
                course.course === courseName && course.grade !== "F"
            )
        );

        updateStudentTableByFilter(passedStudents, courseName);
    });

    document.getElementById("view-failed").addEventListener("click", () => {
        const courseIndex = document.getElementById("course-select").value;
        if (courseIndex === "") {
            alert("Please select a course first.");
            return;
        }

        const courseName = courses[courseIndex].name;

        const failedStudents = students.filter(student =>
            student.courses.some(course =>
                course.course === courseName && course.grade === "F"
            )
        );

        updateStudentTableByFilter(failedStudents, courseName);
    });

    document.getElementById("view-all").addEventListener("click", () => {
        updateStudentTableByFilter(students);
    });

    function updateStudentTableByFilter(filteredStudents, courseName = null) {
        const studentTable = document.getElementById("student-table").getElementsByTagName("tbody")[0];
        studentTable.innerHTML = "";

        filteredStudents.forEach(student => {
            student.courses.forEach(course => {
                if (!courseName || course.course === courseName) {
                    const row = studentTable.insertRow();
                    row.innerHTML = `
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td>${student.surname}</td>
                        <td>${course.midterm}</td>
                        <td>${course.final}</td>
                        <td>${course.grade}</td>
                        <td><button class="delete-btn">Delete</button></td>
                    `;

                    const deleteBtn = row.querySelector(".delete-btn");
                    deleteBtn.addEventListener("click", () => {
                        deleteStudent(student.id, courseName);
                        row.remove();
                    });
                }
            });
        });
    }

    // "View Lecture Students" functionality
    document.getElementById("view-lecture-stats").addEventListener("click", () => {
        const courseIndex = document.getElementById("course-select").value;
        if (courseIndex === "") {
            alert("Please select a course first.");
            return;
        }

        const courseName = courses[courseIndex].name;

        const lectureStudents = students.filter(student =>
            student.courses.some(course => course.course === courseName)
        );

        if (lectureStudents.length === 0) {
            alert(`No students found for the course "${courseName}".`);
            return;
        }

        let totalScore = 0;
        let numPassed = 0;
        let numFailed = 0;

        lectureStudents.forEach(student => {
            student.courses.forEach(course => {
                if (course.course === courseName) {
                    const meanScore = course.midterm * 0.4 + course.final * 0.6;
                    totalScore += meanScore;
                    if (course.grade !== "F") {
                        numPassed++;
                    } else {
                        numFailed++;
                    }
                }
            });
        });

        const meanScore = (totalScore / lectureStudents.length).toFixed(2);

        document.getElementById("num-passed").textContent = numPassed;
        document.getElementById("num-failed").textContent = numFailed;
        document.getElementById("mean-score").textContent = meanScore;

        document.getElementById("lecture-stats").classList.remove("hidden");
    });

    // Search functionality
    document.getElementById("search-button").addEventListener("click", (e) => {
        e.preventDefault();
        const searchId = document.getElementById("search-name").value.trim();
        const result = students.filter(student => student.id === searchId);

        const searchResult = document.getElementById("search-result");
        const gpaResult = document.getElementById("gpa-result");

        searchResult.innerHTML = "";
        if (result.length === 0) {
            searchResult.innerHTML = `<p>No student found with ID "${searchId}".</p>`;
            gpaResult.textContent = "--";
            return;
        }

        result.forEach(student => {
            const studentInfo = document.createElement("div");
            studentInfo.innerHTML = `
                <h3>${student.name} ${student.surname} (ID: ${student.id})</h3>
                <ul>
                    ${student.courses.map(course => `
                        <li>
                            ${course.course}: Midterm - ${course.midterm}, 
                            Final - ${course.final}, 
                            Grade - ${course.grade}
                        </li>`).join('')}
                </ul>
            `;
            searchResult.appendChild(studentInfo);
        });

        const totalCredits = result.reduce((sum, student) => sum + student.courses.length, 0);
        const totalGrades = result.reduce((sum, student) => {
            const gradePoints = { A: 4, B: 3, C: 2, D: 1, F: 0 };
            const studentGrades = student.courses.map(course => gradePoints[course.grade] || 0);
            return sum + studentGrades.reduce((a, b) => a + b, 0);
        }, 0);
        const gpa = (totalGrades / totalCredits).toFixed(2);
        gpaResult.textContent = gpa;
    });
});
