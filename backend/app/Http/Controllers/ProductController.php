<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try
        {
            $perPage = $request->get('showing', 10);
            $search = $request->get('search', '');

            $data = Product::where(function($query) use ($search) {
                        $query->where('name', 'LIKE', "%{$search}%")
                              ->orWhere('description', 'LIKE', "%{$search}%")
                              ->orWhere('price', 'LIKE', "%{$search}%");
                    })->latest()->paginate($perPage);

            return response()->json([
                'data'    => $data,
                'success' => true,
            ], JsonResponse::HTTP_OK);
        }
        catch (Exception $e)
        {
            return response()->json([
                'data'    => [],
                'success' => false,
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required',
            'description' => 'nullable',
            'price' => 'numeric|nullable',
            'category_id' => 'array|nullable',
            'quantity_available' => 'required|integer',
            'image1' => 'file|nullable|image|max:2048',
        ]);

        $product = Product::create($validatedData);

        if ($request->hasFile('image1')) {
            $file = $request->file('image1');
            $fileName = uniqid() . '.' . $file->extension();
            $file->storeAs('store/product', $fileName);
            $product->image1 = $fileName;
            $product->save();
        }

        if ($request->has('category_id')) {
            $product->categories()->sync($request->input('category_id'));
        }

        return response()->json([
            'data'    => $product,
            'success' => true,
            'message' => 'Product created successfully'
        ], JsonResponse::HTTP_CREATED);
    }

    /**
     * Store multiple resources in storage.
     */
    public function multipleStore(Request $request)
    {
        $validatedData = $request->validate([
            'inputs.*.name' => 'required',
            'inputs.*.description' => 'nullable',
            'inputs.*.price' => 'numeric|nullable',
            'inputs.*quantity_available' => 'required|integer',
            'inputs.*.image1' => 'file|nullable|image|max:2048',
        ]);

        try
        {
            $createdData = [];
            foreach ($validatedData['inputs'] as $input) {
                $createdData[] = Product::create($input);
            }

            return response()->json([
                'data'    => $createdData,
                'success' => true,
                'message' => 'Products created successfully'
            ], JsonResponse::HTTP_CREATED);
        }
        catch (Exception $e)
        {
            return response()->json([
                'data'    => [],
                'success' => false,
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try
        {
            $product = Product::findOrFail($id);

            return response()->json([
                'data'    => $product,
                'success' => true,
            ], JsonResponse::HTTP_OK);
        }
        catch (Exception $e)
        {
            return response()->json([
                'data'    => [],
                'success' => false,
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        try
        {
            $product = Product::findOrFail($id);

            return response()->json([
                'data'    => $product,
                'success' => true,
            ], JsonResponse::HTTP_OK);
        }
        catch (Exception $e)
        {
            return response()->json([
                'data'    => [],
                'success' => false,
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try
        {
            $product = Product::findOrFail($id);
            $product->update($request->all());

            if ($request->hasFile('image1')) {
                $file = $request->file('image1');
                $fileName = uniqid() . '.' . $file->extension();
                $file->storeAs('store/product', $fileName);
                $product->image1 = $fileName;
                $product->save();
            }

            if ($request->has('category_id')) {
                $product->categories()->sync($request->input('category_id'));
            }

            return response()->json([
                'data'    => $product,
                'success' => true,
                'message' => 'Product updated successfully'
            ], JsonResponse::HTTP_OK);
        }
        catch (Exception $e)
        {
            return response()->json([
                'data'    => [],
                'success' => false,
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try
        {
            $product = Product::findOrFail($id);
            $product->delete();

            return response()->json([
                'data'    => $product,
                'success' => true,
                'message' => 'Product deleted successfully'
            ], JsonResponse::HTTP_OK);
        }
        catch (Exception $e)
        {
            return response()->json([
                'data'    => [],
                'success' => false,
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all products with categories.
     */
    public function getProduct()
    {
        $products = Product::with('categories')->get();
        Log::info('Categories Response:', $products->toArray());
        return response()->json($products, 200);
    }
}
