const fs = require( 'fs-extra' );
const replace = require( 'replace-in-file' );

/**
 * List of folders in which to update the version string.
 * Paths should start from the project root (e.g., './').
 */
const pluginFiles = [
    'classes/**/*',
    'scripts/**/*',
    'src/**/*',
    'templates/**/*',
    'config.php',
    'product_stock_alert.php'
];

const { version } = JSON.parse( fs.readFileSync( 'package.json' ) );

replace( {
    files: pluginFiles,
    from: [ /PRODUCT_VERSION_SINCE/g, /PRO_PRODUCT_VERSION_SINCE/g ],
    to: version,
} );
