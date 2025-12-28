<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class EducationRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'description',
        'order_index',
    ];

    protected $casts = [
        'order_index' => 'integer',
    ];

    /**
     * Get the document that owns the education record.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
