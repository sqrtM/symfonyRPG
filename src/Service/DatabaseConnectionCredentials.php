<?php

namespace App\Service;

/**
 * Undocumented class
 * PHP Version 8.2.0.
 *
 * @category  Groups a series of packages together.
 * @package   Categorizes the associated element into a logical grouping or subdivision.
 *
 * @author    Mason Pike <masonapike@gmail.com>
 * @license   unlicense https://unlicense.org/
 *
 * @see       http://url.com
 */
class DatabaseConnectionCredentials
{
    private string $connection_string;

    public function __construct(string $host, string $user, string $pass, string $name)
    {
        $this->connection_string =
            "host={$host} 
            dbname={$name} 
            user={$user} 
            password={$pass}";
    }

    public function connectionString()
    {
        return $this->connection_string;
    }
}
