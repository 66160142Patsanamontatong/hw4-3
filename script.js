document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("appointment-form");
    const appointmentList = document.getElementById("appointment-list");

    let appointments = getFromLocalStorage() || [];

    function saveToLocalStorage() {
        try {
            localStorage.setItem("appointments", JSON.stringify(appointments));
        } catch (error) {
            console.error("❌ Error saving to localStorage:", error);
        }
    }

    function getFromLocalStorage() {
        try {
            const data = localStorage.getItem("appointments");
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("❌ Error reading from localStorage:", error);
            return [];
        }
    }

    function renderAppointments() {
        appointmentList.innerHTML = "";
        const today = new Date().toISOString().split("T")[0];

        appointments.forEach((appointment, index) => {
            if (appointment.date >= today) {
                const isConflict = appointments.some((app, i) => 
                    i !== index &&
                    app.date === appointment.date &&
                    ((appointment.startTime >= app.startTime && appointment.startTime < app.endTime) || 
                     (appointment.endTime > app.startTime && appointment.endTime <= app.endTime))
                );

                const row = document.createElement("tr");
                row.className = appointment.status === "cancelled" ? "bg-gray-200 text-gray-500" : isConflict ? "bg-red-100" : "";

                row.innerHTML = `
                    <td class="border p-2 ${appointment.status === 'cancelled' ? 'line-through' : ''}">${appointment.title}</td>
                    <td class="border p-2">${appointment.date}</td>
                    <td class="border p-2">${appointment.startTime} - ${appointment.endTime}</td>
                    <td class="border p-2 ${appointment.status === 'cancelled' ? 'line-through text-red-500' : ''}">
                        ${appointment.status} ${isConflict ? "⚠️ (ซ้ำ)" : ""}
                    </td>
                    <td class="border p-2">
                        ${appointment.status === 'cancelled' ? 
                            `<button class="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700" onclick="deleteAppointment(${index})">ลบ</button>` :
                            `<button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-700" onclick="editAppointment(${index})">แก้ไข</button>
                             <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700" onclick="cancelAppointment(${index})">ยกเลิก</button>`
                        }
                    </td>
                `;

                appointmentList.appendChild(row);
            }
        });
    }

    function getUpcomingAppointments() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        return appointments.filter(app => app.date === tomorrowStr);
    }

    function renderUpcomingAppointments() {
        const upcomingAppointments = getUpcomingAppointments();
        if (upcomingAppointments.length > 0) {
            alert("📅 นัดหมายที่กำลังจะมาถึงพรุ่งนี้:\n" +
                upcomingAppointments.map(app => `- ${app.title} เวลา ${app.startTime} - ${app.endTime}`).join("\n")
            );
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.getElementById("title").value.trim();
        const date = document.getElementById("date").value;
        const startTime = document.getElementById("startTime").value;
        const endTime = document.getElementById("endTime").value;

        if (!title || !date || !startTime || !endTime) {
            alert("❌ กรุณากรอกข้อมูลให้ครบทุกช่อง!");
            return;
        }

        if (startTime >= endTime) {
            alert("❌ เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น!");
            return;
        }

        const newAppointment = {
            id: Date.now().toString(),
            title,
            date,
            startTime,
            endTime,
            status: "confirmed",
        };

        appointments.push(newAppointment);
        saveToLocalStorage();
        renderAppointments();
        form.reset();
    });

    window.cancelAppointment = function (index) {
        appointments[index].status = "cancelled";
        saveToLocalStorage();
        renderAppointments();
    };

    window.deleteAppointment = function (index) {
        appointments.splice(index, 1);
        saveToLocalStorage();
        renderAppointments();
    };

    window.editAppointment = function (index) {
        const appointment = appointments[index];

        document.getElementById("title").value = appointment.title;
        document.getElementById("date").value = appointment.date;
        document.getElementById("startTime").value = appointment.startTime;
        document.getElementById("endTime").value = appointment.endTime;

        appointments.splice(index, 1);
        saveToLocalStorage();
        renderAppointments();
    };

    renderAppointments();
    renderUpcomingAppointments();
});
