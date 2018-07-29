const XlsxPopulate = require('xlsx-populate');
const striptags = require('striptags');
/*
json structure:
{
  columnsBold:true\false
  columns:[col1,col2,col3],
  array of arrays=== rows:[row1,row2,row3]
}
aoa = aray of arays = [row1,row2,row3,...] =example= [row1=[1,2,3],row2=[4,5,6],...]
*/

/**
 *
 *Takes a json repesentation of excel and returs a workbook
 * @param {*} json A json that includes: columnsBold(bool) columns(array of string) rows(array of arrays of strings)
 */
function json2workbook(json){
  return XlsxPopulate.fromBlankAsync()
  .then((workbook)=>{

    let sheet = workbook.sheet("Sheet1");

    for(let j = 0;j<json.columns.length;j++){
     sheet.row(1).cell(j+1).value(striptags(json.columns[j]))
     sheet.row(1).cell(j+1).style({
       "bold":json.columnsBold,
       "fontFamily":"Arial",
      });
    }

    for(let i = 0;i<json.rows.length;i++){
      for(let j =0;j<json.rows[i].length;j++){
        let cell = sheet.row(i+2).cell(j+1);
        cell.value(striptags(json.rows[i][j]));
        cell.style({
          "fontFamily":"Arial",
          "wrapText":true,
          "verticalAlignment":"top",
          "horizontalAlignment":"right",
          "textDirection":"left-to-right",
        });
    }}
    return workbook.outputAsync();
  })
  .catch((err)=>{
    console.log(err);
  });
}


exports.json2workbook = json2workbook;