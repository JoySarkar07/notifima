<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . '/wp-content/plugins/notifima') // Adjust this path
    ->exclude('vendor') // Exclude vendor or other directories if needed
    ->name('*.php');

return PhpCsFixer\Config::create()
    ->setRiskyAllowed(true)
    ->setRules([
        '@PSR12' => true,
        'array_syntax' => ['syntax' => 'short'],
        'binary_operator_spaces' => ['default' => 'align_single_space_minimal'],
        'blank_line_after_opening_tag' => true,
        'cast_spaces' => true,
        'class_attributes_separation' => ['elements' => ['method' => 'one']],
        'concat_space' => ['spacing' => 'one'],
        'function_declaration' => ['closure_function_spacing' => 'one'],
        'lowercase_cast' => true,
        'native_function_casing' => true,
        'no_extra_blank_lines' => true,
        'no_spaces_around_offset' => true,
        'no_trailing_whitespace' => true,
        'single_blank_line_at_eof' => true,
        'single_quote' => true,
        'standardize_not_equals' => true,
        'ternary_operator_spaces' => true,
        'trailing_comma_in_multiline' => ['elements' => ['arrays']],
        'whitespace_after_comma_in_array' => true,
    ])
    ->setFinder($finder);