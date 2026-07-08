const ExcelJS = require("exceljs");
const { format } = require("@fast-csv/format");

const productRepository = require("./product.repository");

exports.exportCsv = async (query, res) => {

    const products =
        await productRepository.findAllForExport(query);

    res.setHeader(
        "Content-Type",
        "text/csv"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=products.csv"
    );

    const csvStream = format({
        headers: true
    });

    csvStream.pipe(res);

    products.forEach(product => {

        csvStream.write({

            "Category Name":
                product.category.name,

            "Product Name":
                product.name,

            "Product Price":
                product.price,

            "Product UniqueId":
                product.uniqueId

        });

    });

    csvStream.end();

};

exports.exportXlsx = async (query, res) => {

    const products =
        await productRepository.findAllForExport(query);

    const workbook =
        new ExcelJS.Workbook();

    const worksheet =
        workbook.addWorksheet("Products");

    worksheet.columns = [

        {
            header: "Category Name",
            key: "category"
        },

        {
            header: "Product Name",
            key: "name"
        },

        {
            header: "Product Price",
            key: "price"
        },

        {
            header: "Product UniqueId",
            key: "uniqueId"
        }

    ];

    products.forEach(product => {

        worksheet.addRow({

            category:
                product.category.name,

            name:
                product.name,

            price:
                product.price,

            uniqueId:
                product.uniqueId

        });

    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=products.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

};