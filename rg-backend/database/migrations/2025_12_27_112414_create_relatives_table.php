<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('relatives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->enum('qarindoshligi', ['Otasi', 'Onasi', 'Akasi', 'Ukasi', 'Opasi']); // Relationship type
            $table->string('fio'); // Full name (F.I.Sh.)
            $table->string('tugilgan'); // Birth year and place (e.g., "1941 ...")
            $table->boolean('vafot_etgan')->default(false); // Deceased or not
            $table->string('ish_joyi'); // Work place and position
            $table->string('turar_joyi'); // Residence address
            $table->integer('order_index')->default(0); // To maintain order of entries
            $table->timestamps();

            $table->index(['document_id', 'order_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('relatives');
    }
};
