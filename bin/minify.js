const { minify: minifyJs } = require( 'terser' );
const CleanCSS = require( 'clean-css' );
const fs = require( 'fs-extra' );
const path = require( 'path' );
const glob = require( 'glob' );
const chalk = require( 'chalk' );

/**
 * This is the list of folders where the .js and .css files are present.
 * format: (path start from the root of the project './')
 * 1. 'dist' (directory)
 *  */ 
const sourceFolders = [
    'scripts', 
]; 

let outputFolder;
const { name } = JSON.parse( fs.readFileSync( 'package.json' ) );

(async () => {
  for ( const sourceFolder of sourceFolders ) {
    console.log(
        chalk.bgYellowBright.black(
            `🧹Minification start in ${ sourceFolder }`
        )
    );
    const files = glob.sync(`${ sourceFolder }/**/*.{js,css}`);

    for ( const file of files ) {
      try {
        console.log(
            chalk.bgCyanBright.black(
                `🧹Minify ${ file }`
            )
        );
        const ext = path.extname( file );
        const content = await fs.readFile( file, 'utf8' );

        let minified;
        if (ext === '.js') {
          // min path for js
          outputFolder = 'assets/js/';
          const result = await minifyJs( content );
          minified = result.code;
        } else if (ext === '.css') {
          // min path for css
          outputFolder = 'assets/styles/';
          const result = new CleanCSS().minify( content );
          minified = result.styles;
        }

        const relativePath = path.relative( sourceFolder, file );
        const parsed = path.parse( relativePath );
        const newFileName = `${ name }-${ parsed.name }.min${ parsed.ext }`;
        const outputPath = path.join( outputFolder , newFileName );

        await fs.outputFile( outputPath, minified );
      } catch (err) {
        console.log(
            chalk.red(
                `❌ Error minifying ${ file }: ${ err.message }`
            )
        );
      }
    }
  }
    console.log(
        chalk.bgGreenBright.black(
            '✅ Minification completed'
        )
    );
})();
