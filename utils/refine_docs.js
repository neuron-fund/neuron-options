fs = require('fs');

const DOCS_PTH = './docs' //place your eurity contracts project path here

function recursive_fix(dir){    
    for (file_or_dir of fs.readdirSync(dir)){
        let pth = dir + '/' + file_or_dir

        if( fs.lstatSync(pth).isDirectory()){
            recursive_fix(pth)
          continue
        }
        if (!pth.includes('.md')){continue}
        console.log(pth)
        let doc_text = fs.readFileSync(pth, 'utf8')
        //doc_text.substring(0, 17) # Solidity API /n/n#
        doc_text = doc_text.substring(17)
        fs.writeFileSync( pth, doc_text)
    }
}


recursive_fix(DOCS_PTH)