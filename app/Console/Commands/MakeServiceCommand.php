<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Illuminate\Filesystem\Filesystem;

class MakeServiceCommand extends Command
{
    protected $signature = 'make:service {name}';
    protected $description = 'Create a new service class';
    protected $files;

    public function __construct(Filesystem $files)
    {
        parent::__construct();

        $this->files = $files;
    }

    public function handle()
    {
        $name = Str::studly($this->argument('name'));
        $path = app_path("Services/{$name}.php");

        if ($this->files->exists($path)) {
            $this->error('Service already exists!');
            return Command::FAILURE;
        }

        $this->makeDirectory($path);

        $stub = <<<EOT
<?php

namespace App\Services;

class {$name}
{
    // Your service logic here
}
EOT;

        $this->files->put($path, $stub);
        $this->info("Service class {$name} created successfully.");
        return Command::SUCCESS;
    }

    protected function makeDirectory($path)
    {
        if (! $this->files->isDirectory(dirname($path))) {
            $this->files->makeDirectory(dirname($path), 0755, true);
        }
    }
}
