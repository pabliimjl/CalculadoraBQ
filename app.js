let datos = [];
let valorAPB = 22000;

const inputUB =
    document.getElementById("valorUB");

const filtro =
    document.getElementById("filtro");

async function cargarAPB() {

    try {

        const response = await fetch(
            "https://api-ubc.onrender.com/apb"
        );

        const data = await response.json();

        valorAPB = data.apb;

        actualizarValores();

    } catch (error) {

        console.error(
            "Error cargando APB:",
            error
        );
    }
}


async function cargarDatos() {

    try {

        const response =
            await fetch(
                "https://api-ubc.onrender.com/nbu"
            );

        const json =
            await response.json();

        datos =
            json.determinaciones;

        renderTabla();

    } catch (error) {

        console.error(
            "Error cargando NBU:",
            error
        );
    }
}

function renderTabla() {

    const tbody =
        document.getElementById(
            "tablaBody"
        );

    tbody.innerHTML = "";

    datos.forEach(item => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>${item.codigo}</td>

            <td>${item.determinacion}</td>

            <td class="ub">
                ${item.ub}
            </td>

            <td class="precio">
                -
            </td>

            <td>

                <button
                    onclick="agregarItem(this)"
                >
                    +
                </button>

            </td>
        `;

        tbody.appendChild(tr);
    });

    actualizarValores();
}

function actualizarValores() {

    const valorUB =
        parseFloat(inputUB.value) || 0;

    const filas =
        document.querySelectorAll(
            ".tabla-principal tbody tr"
        );

    filas.forEach(fila => {

        const codigo =
            fila.children[0]
                .textContent
                .trim();

        const ub =
            parseFloat(
                fila.querySelector(".ub")
                    .textContent
            ) || 0;

        let total = 0;

        // ACTO BIOQUIMICO
        if (codigo === "660001") {

            total = valorAPB;

        } else {

            total = ub * valorUB;
        }

        fila.querySelector(".precio")
            .textContent =
            total.toLocaleString(
                "es-AR",
                {
                    style: "currency",
                    currency: "ARS"
                }
            );
    });
}


function filtrarTabla() {

    const texto =
        filtro.value.toLowerCase();

    const filas =
        document.querySelectorAll(
            "#tablaBody tr"
        );

    filas.forEach(fila => {

        const determinacion =
            fila.children[1]
                .textContent
                .toLowerCase();

        const codigo =
            fila.children[0]
                .textContent
                .toLowerCase();

        const visible =
            determinacion.includes(texto)
            ||
            codigo.includes(texto);

        fila.style.display =
            visible
                ? ""
                : "none";
    });
}

function agregarItem(boton) {

    const fila =
        boton.closest("tr");

    const codigo =
        fila.children[0].textContent;

    const determinacion =
        fila.children[1].textContent;

    const ub =
        fila.children[2].textContent;

    const valor =
        fila.children[3].textContent;

    const tbody =
        document.querySelector(
            "#tablaResumen tbody"
        );

    const nuevaFila =
        document.createElement("tr");

    nuevaFila.innerHTML = `
        <td>${codigo}</td>

        <td>${determinacion}</td>

        <td>${ub}</td>

        <td class="valorResumen">
            ${valor}
        </td>

        <td>

            <button
                onclick="eliminarItem(this)"
            >
                X
            </button>

        </td>
    `;

    tbody.appendChild(nuevaFila);

    actualizarTotal();
}

function eliminarItem(boton) {

    boton.closest("tr").remove();

    actualizarTotal();
}

function actualizarTotal() {

    const valores =
        document.querySelectorAll(
            ".valorResumen"
        );

    let total = 0;

    valores.forEach(v => {

        const numero =
            parseFloat(
                v.textContent
                    .replace(/[^0-9,-]+/g, "")
                    .replace(".", "")
                    .replace(",", ".")
            );

        total += numero;
    });

    document.getElementById(
        "totalFinal"
    ).textContent =
        total.toLocaleString(
            "es-AR",
            {
                style: "currency",
                currency: "ARS"
            }
        );
}

async function cargarUBC() {

    try {

        const response = await fetch(
            "https://api-ubc.onrender.com/ubc"
        );

        const data = await response.json();

        const ubcLimpio =
            data.ubc
                .replace("$", "")
                .replace(/\./g, "")
                .replace(",", ".");

        inputUB.value = parseFloat(ubcLimpio);

        actualizarValores();

    } catch (error) {

        console.error(error);
    }
}

async function imprimirPDF() {

    const { jsPDF } =
        window.jspdf;

    const doc =
        new jsPDF();

    doc.text(
        "Detalle de pago",
        14,
        15
    );

    const filas = [];

    document.querySelectorAll(
        "#tablaResumen tbody tr"
    ).forEach(fila => {

        const tds =
            fila.querySelectorAll("td");

        filas.push([
            tds[0].textContent,
            tds[1].textContent,
            tds[2].textContent,
            tds[3].textContent
        ]);
    });

    doc.autoTable({

        startY: 20,

        head: [[
            "Código",
            "Determinación",
            "UB",
            "Valor"
        ]],

        body: filas
    });

    doc.save("detalle.pdf");
}

inputUB.addEventListener(
    "input",
    actualizarValores
);

filtro.addEventListener(
    "input",
    filtrarTabla
);

cargarDatos();
cargarUBC();
cargarAPB();