<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reference extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'author',
        'year',
        'type',
    ];

    protected $casts = [
        'year' => 'integer',
    ];

    /**
     * Get the user that owns the reference.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
