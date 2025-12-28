<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('personal_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->string('familya');  // Last name
            $table->string('ism');  // First name
            $table->string('sharif');  // Middle name
            $table->string('photo_path')->nullable();  // Path to uploaded photo (3x4)
            $table->string('joriy_lavozim_sanasi');  // Current position date (e.g., "2010 yil 06 sentabrdan")
            $table->string('joriy_lavozim_toliq');  // Current position full description
            $table->date('tugilgan_sana');  // Birth date
            $table->string('tugilgan_joyi');  // Birth place
            $table->string('millati');  // Nationality
            $table->string('malumoti');  // Education level: Oliy, O'rta maxsus, O'rta
            $table->timestamps();

            $table->unique('document_id');  // One personal information per document
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_information');
    }
};
