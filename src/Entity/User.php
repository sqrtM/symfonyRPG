<?php

declare(strict_types=1);

namespace App\Entity;

class User
{
    private string $name;
    public \PgSql\Result $results;
    private \PgSql\Connection $con;

    public function __construct(string $name, \PgSql\Connection $con)
    {
        $this->name = $name;
        $this->con = $con;
    }

    public function exists(): bool
    {
        $results = pg_query_params($this->con, "SELECT * FROM games WHERE name = $1;", array($this->name));
        $this->results = $results;
        return count(pg_fetch_all($results)) > 0 ? true : false;
    }
}
