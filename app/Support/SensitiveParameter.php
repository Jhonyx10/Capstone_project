<?php

// Polyfill for PHP < 8.2
if (!class_exists('SensitiveParameter')) {
    #[Attribute(Attribute::TARGET_PARAMETER)]
    class SensitiveParameter {}
}
