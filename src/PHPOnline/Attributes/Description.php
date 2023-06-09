<?php

declare(strict_types=1);

namespace PHPOnline\Attributes;

use Attribute;

#[Attribute]
final readonly class Description
{
    public function __construct(
        public string $description,
    ) {}
}
