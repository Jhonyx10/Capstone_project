<?php

namespace App\Services;

use App\Models\Hotline;

class HotlineService
{
    public function store(array $data): Hotline
    {
        return Hotline::create($data);
    }

    public function update(array $data, int $id)
    {
        $hotline = Hotline::findOrFail($id);
        $hotline->update($data);

        return $hotline;
    }

        public function index()
    {
        return Hotline::get();
    }
}