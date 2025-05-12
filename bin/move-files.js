const fs = require( "fs-extra" );
const chalk = require( "chalk" );
const path = require( "path" );
const glob = require( "glob" );

const targetFiles = [ "assets/js" ];
const dest = [
    {
        dest: "assets/js/externals",
        rule: "moveNum",
    },
];

// Ensure destination directory exists
fs.ensureDirSync( dest[ 0 ].dest );

targetFiles.forEach( ( file, ind ) => {
    const fileDir = path.resolve( file );
    const files = glob.sync( `${ fileDir }/**/*.{js,php}` );
    const rule = dest[ ind ].rule;

    if ( rule === "moveNum" ) {
        files.forEach( ( subfile ) => {
            const fullPath = path.resolve( subfile );
            const basename = path.basename( fullPath );

            if ( basename.match( /^\d+/ ) ) {
                const destPath = path.join( dest[ ind ].dest, basename ); // Create full destination path

                fs.move( fullPath, destPath, { overwrite: true }, ( error ) => {
                    if ( error ) {
                        console.log( chalk.red( error ) );
                    } else {
                        console.log(
                            chalk.greenBright(
                                `File moved: ${ subfile } → ${ destPath }`
                            )
                        );
                    }
                } );
            }
        } );
    }
} );
