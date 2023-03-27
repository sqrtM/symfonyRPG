<?php

namespace App\Controller;

use App\Service\DatabaseConnectionCredentials;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * Extends the Abstract Controller class with Environment Variable Getters.
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
class AbsCon extends AbstractController
{
    public function getConnectionString(): string
    {
        $dbCredentials = new DatabaseConnectionCredentials(
            $this->getParameter('app.dbhost'),
            $this->getParameter('app.dbuser'),
            $this->getParameter('app.dbpass'),
            $this->getParameter('app.dbname'),
        );

        return $dbCredentials->connectionString();
    }
}
