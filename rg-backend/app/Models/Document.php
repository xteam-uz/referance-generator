<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_type',
        'status',
    ];

    protected $casts = [
        'document_type' => 'string',
        'status' => 'string',
    ];

    /**
     * Get the user that owns the document.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the personal information for the document.
     */
    public function personalInformation(): HasOne
    {
        return $this->hasOne(PersonalInformation::class);
    }

    /**
     * Get the education records for the document.
     */
    public function educationRecords(): HasMany
    {
        return $this->hasMany(EducationRecord::class)->orderBy('order_index');
    }

    /**
     * Get the relatives for the document.
     */
    public function relatives(): HasMany
    {
        return $this->hasMany(Relative::class)->orderBy('order_index');
    }
}
