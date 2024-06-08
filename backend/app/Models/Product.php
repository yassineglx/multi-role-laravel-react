<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $fillable = [
        'name',
        'description',
        'price',
        'quantity_available',
        'image1',

    ];


    public function Categories(){
        return $this->belongsToMany(Category::class);
       }
}


