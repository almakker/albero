<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

use Bitrix\Main\Loader;
use Bitrix\Main\Application;
use Bitrix\Main\Web\Json;
use Bitrix\Main\Engine\Contract\Controllerable;
use Bitrix\Main\Engine\ActionFilter;
use Bitrix\Iblock\Elements\ElementTable;
use Bitrix\Main\UI\PageNavigation;
use Bitrix\Main\SystemException;
use Bitrix\Main\ArgumentException;
use Bitrix\Main\LoaderException;
use Bitrix\Main\Error;

/**
 * Компонент для отображения списка элементов инфоблока с кешированием
 */
class IblockListComponent extends CBitrixComponent implements Controllerable
{

    public function __construct(?Request $request = null)
    {
        parent::__construct($request);
        if (!Loader::includeModule('iblock')) {
            throw new SystemException('Модуль iblock не установлен');
        }
    }

    /**
     * Конфигурация 
     * @return array
     */
    public function configureActions(): array
    {
        return [
            'loadMore' => [
                'prefilters' => [
                    new ActionFilter\Authentication(),
                    new ActionFilter\HttpMethod(
                        [ActionFilter\HttpMethod::METHOD_POST]
                    ),
                    new ActionFilter\Csrf(),
                ]
            ],
        ];
    }

    /**
     * Подготовка параметров компонента
     * @param array $arParams 
     * @return array 
     * @throws ArgumentException
     */
    public function onPrepareComponentParams(array $arParams): array
    {
        if (empty($arParams['IBLOCK_ID'])) {
            throw new ArgumentException('Не указан ID инфоблока');
        }

        if (!isset($arParams["CACHE_TIME"])) {
            $arParams["CACHE_TIME"] = 3600;
        }
        if (!isset($arParams["ELEMENTS_PER_PAGE"])) {
            $arParams["ELEMENTS_PER_PAGE"] = 10;
        }
        if (!isset($arParams["FIELDS"]) || !is_array($arParams["FIELDS"])) {
            $arParams["FIELDS"] = ["ID", "NAME", "PREVIEW_TEXT"];
        }

        return $arParams;
    }

    /**
     * Список параметров для подписи
     * @return string[]
     */
    protected function listKeysSignedParameters(): array
    {
        return [
            "IBLOCK_ID",
            "ELEMENTS_PER_PAGE",
            "FIELDS",
        ];
    }

    /**
     * Выполнение компонента
     * @return array|null 
     * @throws LoaderException|SystemException
     */
    public function executeComponent(): ?array
    {
        try {
            
            $this->arResult = [
                'ITEMS' => [],
                'NAV_OBJECT' => null,
            ];

            if ($this->startResultCache()) {
                $this->arResult = $this->getElements();

                if ($this->arResult['ITEMS']) {
                    $this->setResultCacheKeys(['NAV_OBJECT']);
                    
                    $this->getComponent()->setResultCacheKeys(['TAG']);
                    $this->AbortResultCache();
                    
                    $taggedCache = Application::getInstance()->getTaggedCache();
                    $taggedCache->startTagCache($this->getCachePath());
                    $taggedCache->registerTag('iblock_id_' . $this->arParams['IBLOCK_ID']);
                    $taggedCache->endTagCache();
                }

                $this->includeComponentTemplate();
            }
            
            return $this->arResult;

        } catch (\Exception $e) {
            ShowError(new Error($e->getMessage() ?: 'Ошибка при выполнении компонента'));
        }

        return null;
    }

    /**
     * Получение списка элементов
     * @return array
     * @throws SystemException
     */
    protected function getElements(): array
    {
        try {
            
            $nav = new PageNavigation("nav-more-elements");
            $nav->allowAllRecords(false)
                ->setPageSize($this->arParams["ELEMENTS_PER_PAGE"])
                ->initFromUri();

            $select = array_merge(['ID'], $this->arParams['FIELDS']);

            $elements = ElementTable::getList([
                'select' => $select,
                'filter' => ['IBLOCK_ID' => $this->arParams['IBLOCK_ID']],
                'offset' => $nav->getOffset(),
                'limit' => $nav->getLimit(),
                'count_total' => true,
            ]);

            $nav->setRecordCount($elements->getCount());

            return [
                'ITEMS' => $elements->fetchAll(),
                'NAV_OBJECT' => $nav,
            ];

        } catch (\Exception $e) {
            throw new SystemException('Ошибка при получении элементов: ' . $e->getMessage());
        }
    }

    /**
     * AJAX подгрузка элементов
     * @return array
     * @throws LoaderException|SystemException
     */
    public function loadMoreAction(): array
    {
        try {

            $result = $this->getElements();
            
            return [
                'items' => $result['ITEMS'],
                'navObject' => [
                    'currentPage' => $result['NAV_OBJECT']->getCurrentPage(),
                    'pageCount' => $result['NAV_OBJECT']->getPageCount(),
                ],
            ];

        } catch (\Exception $e) {
            throw new SystemException('Ошибка при загрузке элементов: ' . $e->getMessage());
        }
    }
} 