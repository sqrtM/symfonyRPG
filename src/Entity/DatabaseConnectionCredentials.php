<?php

namespace App\Entity;

class DatabaseConnectionCredentials
{
    private string $dbhost;
    private string $dbuser;
    private string $dbpass;
    private string $dbname;

    public function __construct(string $host, string $user, string $pass, string $name)
    {
        $this->dbhost = $host;
        $this->dbuser = $user;
        $this->dbpass = $pass;
        $this->dbname = $name;
    }

    public function host(): string
    {
        return $this->dbhost;
    }

    public function user(): string
    {
        return $this->dbuser;
    }

    public function pass(): string
    {
        return $this->dbpass;
    }

    public function name(): string
    {
        return $this->dbname;
    }
}
