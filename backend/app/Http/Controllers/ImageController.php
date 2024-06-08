<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    //
    public function show($filename)
    {

        $contents = Storage::get('optic/product/'.$filename);
        return $contents ;
    }
}
