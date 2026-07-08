const fs = require("fs");
const path = require("path");

const csvParser = require("csv-parser");
const ExcelJS = require("exceljs");

const productRepository = require("./product.repository");

const apiError = require("../../utils/apiError");
const HTTP = require("../../utils/httpStatus");

const BATCH_SIZE = 500;

exports.bulkUpload = async (filePath) => {

    try {

        const extension =
            path.extname(filePath).toLowerCase();

        let rows = [];

        if (extension === ".csv") {

            rows = await parseCsv(filePath);

        }
        else if (extension === ".xlsx") {

            rows = await parseXlsx(filePath);

        }
        else {

            throw apiError(
                HTTP.BAD_REQUEST,
                "Only CSV and XLSX files are supported."
            );

        }

        const categories =
            await productRepository.findAllCategories();

        const existingProducts =
            await productRepository.findAllProductNames();

        const categoryMap = createCategoryMap(categories);

        const productSet = createProductSet(existingProducts);

        return await processRows(

            rows,

            categoryMap,

            productSet

        );

    }
    finally {

        if (
            filePath &&
            fs.existsSync(filePath)
        ) {

            fs.unlinkSync(filePath);

        }

    }

};

async function parseCsv(filePath) {

    return new Promise((resolve, reject) => {

        const rows = [];

        fs.createReadStream(filePath)

            .pipe(csvParser())

            .on("data", row => {

                rows.push(row);

            })

            .on("end", () => {

                resolve(rows);

            })

            .on("error", reject);

    });

}

async function parseXlsx(filePath) {

    const workbook =
        new ExcelJS.Workbook();

    await workbook.xlsx.readFile(filePath);

    const worksheet =
        workbook.worksheets[0];

    const headers = [];

    worksheet.getRow(1).eachCell(cell => {

        headers.push(
            String(cell.value).trim()
        );

    });

    const rows = [];

    worksheet.eachRow((row, index) => {

        if (index === 1) {
            return;
        }

        const object = {};

        row.eachCell((cell, column) => {

            object[
                headers[column - 1]
            ] = cell.value;

        });

        rows.push(object);

    });

    return rows;

}

function createCategoryMap(categories) {

    const map = new Map();

    categories.forEach(category => {

        map.set(

            category.name
                .trim()
                .toLowerCase(),

            category.id

        );

    });

    return map;

}

function createProductSet(products) {

    const set = new Set();

    products.forEach(product => {

        set.add(

            product.name
                .trim()
                .toLowerCase()

        );

    });

    return set;

}

function chunkArray(array, size) {

    const chunks = [];

    for (

        let i = 0;

        i < array.length;

        i += size

    ) {

        chunks.push(

            array.slice(
                i,
                i + size
            )

        );

    }

    return chunks;

}
async function processRows(
    rows,
    categoryMap,
    productSet
) {

    const validProducts = [];

    const errors = [];

    for (let index = 0; index < rows.length; index++) {

        const row = rows[index];

        const rowNumber = index + 2;

        const categoryName =
            String(
                row.Category || ""
            ).trim();

        const productName =
            String(
                row["Product Name"] || ""
            ).trim();

        const price =
            Number(row.Price);

        if (!categoryName) {

            errors.push({

                row: rowNumber,

                message: "Category is required."

            });

            continue;

        }

        if (!productName) {

            errors.push({

                row: rowNumber,

                message: "Product name is required."

            });

            continue;

        }

        if (

            Number.isNaN(price) ||

            price < 0

        ) {

            errors.push({

                row: rowNumber,

                message: "Invalid product price."

            });

            continue;

        }

        const categoryId =
            categoryMap.get(
                categoryName.toLowerCase()
            );

        if (!categoryId) {

            errors.push({

                row: rowNumber,

                message: `Category '${categoryName}' not found.`

            });

            continue;

        }

        if (

            productSet.has(
                productName.toLowerCase()
            )

        ) {

            errors.push({

                row: rowNumber,

                message: `Product '${productName}' already exists.`

            });

            continue;

        }

        productSet.add(
            productName.toLowerCase()
        );

        validProducts.push({

            categoryId,

            name: productName,

            price,

            imagePath: null

        });

    }

    const chunks =
        chunkArray(
            validProducts,
            BATCH_SIZE
        );

    let inserted = 0;

    for (const chunk of chunks) {

        await productRepository.bulkCreate(
            chunk
        );

        inserted += chunk.length;

    }

    return {

        totalRows: rows.length,

        inserted,

        failed: errors.length,

        errors

    };

}