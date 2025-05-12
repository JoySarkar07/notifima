const fs = require( "fs-extra" );
const path = require( "path" );
const { exec } = require( "child_process" );
const chalk = require( "chalk" );
const _ = require( "lodash" );
const glob = require( "glob" );

/**
 * Put the folder and files that is needed in the production. ( path start from the root of the project './' )
 */
const pluginFiles = [
    "assets/",
    "classes/",
    "languages/",
    "log/",
    "templates/",
    "vendor/",
    "config.php",
    "composer.lock",
    "composer.json",
    "product_stock_alert.php",
    "readme.txt",
];

/**
 * Put the files that is not needed in the production. ( path start from the root of the project './' )
 * remove this files when the work is done.
 */
const removeFiles = [ "composer.json", "composer.lock" ];

const { version, displayName } = JSON.parse(
    fs.readFileSync( "package.json" )
);

exec(
    "rm -rf *",
    {
        cwd: "release",
    },
    ( error ) => {
        if ( error ) {
            console.log(
                chalk.yellow( `⚠️ Could not find the release directory.` )
            );
            console.log(
                chalk.green( `🗂 Creating the release directory ...` )
            );
            // Making build folder.
            fs.mkdirp( "release" );
        }

        const dest = `release/${ displayName }`; // Temporary folder name after coping all the files here.
        fs.mkdirp( dest );

        console.log( `🗜 Started making the zip ...` );
        try {
            console.log( `⚙️ Copying plugin files ...` );

            // Coping all the files into build folder.
            pluginFiles.forEach( ( file ) => {
                fs.copySync( file, `${ dest }/${ file }` );
            } );
            console.log( `📂 Finished copying files.` );
        } catch ( err ) {
            console.error(
                chalk.red( "❌ Could not copy plugin files." ),
                err
            );
            return;
        }

        // exec(
        //     'composer install --optimize-autoloader --no-dev',
        //     {
        //         cwd: dest
        //     },
        //     ( error ) => {
        //         if ( error ) {
        //             console.log(
        //                 chalk.red(
        //                     `❌ Could not install composer in ${ dest } directory.`
        //                 )
        //             );
        //             console.log( chalk.bgRed.black( error ) );

        //             return;
        //         }

        //         console.log(
        //             `⚡️ Installed composer packages in ${ dest } directory.`
        //         );

        // Removing files that is not needed in the production now.
        removeFiles.forEach( ( file ) => {
            fs.removeSync( `${ dest }/${ file }` );
        } );

        // Output zip file name.
        const zipFile = `${ displayName }-v${ version }.zip`;

        console.log( `📦 Making the zip file ${ zipFile } ...` );

        // Making the zip file here.
        exec(
            `zip ${ zipFile } ${ displayName } -rq`,
            {
                cwd: "release",
            },
            ( error ) => {
                if ( error ) {
                    console.log(
                        chalk.red( `❌ Could not make ${ zipFile }.` )
                    );
                    console.log( chalk.bgRed.black( error ) );

                    return;
                }

                fs.removeSync( dest );
                console.log( chalk.green( `✅  ${ zipFile } is ready. 🎉` ) );
            }
        );
        // }
        // );
    }
);
