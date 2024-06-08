<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Create a new category.
     */
    public function createCategory(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|unique:categories,name',
            'CategoryChoix' => 'required',
        ]);

        $category = Category::create($validatedData);

        return response()->json($category, 201);
    }

    /**
     * Get all categories.
     */
    public function getCategory()
    {
        $categories = Category::all();
        Log::info('Categories Response:', $categories->toArray());
        return response()->json($categories, 200);
    }
}
