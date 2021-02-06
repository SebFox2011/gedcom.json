import Parsing from "./ToGEDCOM/models/Parsing";

export function Convert(argv:any) {
    let parse = new Parsing();

    if (argv.path) {
        parse.SetFilePath(argv.path as string);
    }

    if (argv.opt) {
        parse.SetConfigFile(argv.opt as string);
    }

    let silent = false;
    if (argv.silent) {
        silent = true;
    }

    let onlyStats = false;
    if (argv.onlyStats) {
        onlyStats = true;
    }

    let start = new Date().getTime();
    parse.ParseFileAsync().then(result => {
        if (argv.out) {
            parse.SaveAs(result.Lines, argv.out as string);
        }
        else {

            if (silent) {
                return;
            }

            if (!onlyStats) {
                // print in console
                console.log(JSON.stringify(result.Lines, null, 1));
            }
        }

        if (silent) {
            return;
        }
        
        console.log("");
        console.log("-----------------------------------------------");
        // console.log(`Lines: ${result.Statistics.LinesCount}`);
        // console.log(`Parsed Lines: ${result.Statistics.ParsedLinesCount}`);
        // console.log(`Not Parsed Lines: ${result.Statistics.NotParsedLinesCount}`);
        // console.log(`Not Parsed Lines because of user defined Tag: ${result.Statistics.NotParsedLinesWithoutGEDCOMTagCount}`);
        // console.log(`Incorrect Lines: ${result.Statistics.IncorrectLinesCount}`);
        console.log(`Parsing Time: ${(new Date().getTime() - start)} ms`);
        console.log("-----------------------------------------------");
        console.log("");
        // if (result.Statistics.NotParsedLinesCount > 0) {
        //     console.log(`Not Parsed Lines: ${result.Statistics.NotParsedLinesList}`);
        // }

        // if (result.Statistics.IncorrectLinesCount > 0) {
        //     console.log("");
        //     console.log("Incorrect Lines:");
        //     console.log("");
        //     console.log("Line\tText");
        //     console.log("-----------------------------------------------");
        //     result.Statistics.IncorrectLines.forEach((line: any) => {
        //         console.log(`${line.LineNumber}\t${line.Line}`);
        //     });
        // }

    }).catch(e => {
        console.log(e);
    });
}