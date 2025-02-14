<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

use Bitrix\Main\Loader;
use Bitrix\Iblock\IblockTable;

if (!Loader::includeModule('iblock')) {
    return;
}

// Получаем список инфоблоков
$iblocks = [];
$res = IblockTable::getList([
    'select' => ['ID', 'NAME'],
    'filter' => ['ACTIVE' => 'Y']
]);
while ($iblock = $res->fetch()) {
    $iblocks[$iblock['ID']] = '[' . $iblock['ID'] . '] ' . $iblock['NAME'];
}

$arComponentParameters = [
    "GROUPS" => [],
    "PARAMETERS" => [
        "IBLOCK_ID" => [
            "PARENT" => "BASE",
            "NAME" => "ID инфоблока",
            "TYPE" => "LIST",
            "VALUES" => $iblocks,
            "REFRESH" => "Y",
        ],
        "ELEMENTS_PER_PAGE" => [
            "PARENT" => "BASE",
            "NAME" => "Количество элементов на странице",
            "TYPE" => "STRING",
            "DEFAULT" => "10",
        ],
        "CACHE_TIME" => ["DEFAULT" => 3600],
        "FIELDS" => [
            "PARENT" => "BASE",
            "NAME" => "Выбираемые поля",
            "TYPE" => "LIST",
            "MULTIPLE" => "Y",
            "VALUES" => [
                "ID" => "ID",
                "NAME" => "Название",
                "PREVIEW_TEXT" => "Анонс",
                "DETAIL_TEXT" => "Детальное описание",
                "PREVIEW_PICTURE" => "Картинка анонса",
                "DETAIL_PICTURE" => "Детальная картинка",
                "DATE_CREATE" => "Дата создания",
            ],
            "DEFAULT" => ["ID", "NAME", "PREVIEW_TEXT"],
        ],
    ],
]; 