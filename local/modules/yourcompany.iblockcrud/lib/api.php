<?php
namespace YourCompany\IblockCRUD;

use Bitrix\Main\Context;
use Bitrix\Main\Engine\Controller;
use Bitrix\Main\Engine\Response;
use Bitrix\Main\Engine\Request;
use Bitrix\Iblock\IblockTable;
use Bitrix\Main\Error;
use Bitrix\Main\UI\PageNavigation;
use Bitrix\Main\Web\HttpClient;
use Bitrix\Main\Security\Sign\Signer;
use Bitrix\Main\SystemException;
use Bitrix\Main\ArgumentException;
use Bitrix\Main\LoaderException;
use Bitrix\Main\Loader;

class Api extends Controller
{
    public function __construct(?Request $request = null)
    {
        parent::__construct($request);
        if (!Loader::includeModule('iblock')) {
            throw new SystemException('Модуль iblock не установлен');
        }
    }

    /**
     * Конфигурация действий контроллера
     * @return array
     */
    public function configureActions(): array
    {
        return [
            'getElement' => ['prefilters' => []],
            'getElements' => ['prefilters' => []],
            'createElement' => ['prefilters' => []],
            'updateElement' => ['prefilters' => []],
            'deleteElement' => ['prefilters' => []]
        ];
    }

    /**
     * Получение одного элемента инфоблока
     * @param int $iblockId
     * @param int $elementId
     * @return array|null
     */
    public function getElementAction(int $iblockId, int $elementId): ?array
    {
        try {

            if (!$iblockId || !$elementId) {
                throw new ArgumentException('Необходимо указать ID инфоблока и элемента');
            }

            $element = \CIBlockElement::GetByID($elementId)->Fetch();
            if (!$element) {
                throw new SystemException('Элемент не найден');
            }

            return $element;
            
        } catch (\Exception $e) {
            $this->addError(new Error($e->getMessage() ?: 'Произошла ошибка при получении элемента'));
        }

        return null;
    }

    /**
     * Получение списка элементов с фильтрацией и пагинацией
     * @param int $iblockId
     * @param array $filter
     * @param int $page
     * @param int $pageSize
     * @return array|null
     */
    public function getElementsAction(int $iblockId, array $filter = [], int $page = 1, int $pageSize = 20): ?array
    {
        try {
            
            if (!$iblockId) {
                throw new ArgumentException('Необходимо указать ID инфоблока');
            }

            $nav = new PageNavigation('elements');
            $nav->setPageSize($pageSize);
            $nav->setCurrentPage($page);

            $arFilter = ['IBLOCK_ID' => $iblockId];

            if (!empty($filter['NAME'])) {
                $arFilter['%NAME'] = $filter['NAME'];
            }
            if (!empty($filter['CODE'])) {
                $arFilter['CODE'] = $filter['CODE'];
            }
            if (!empty($filter['DATE_CREATE_from'])) {
                $arFilter['>=DATE_CREATE'] = $filter['DATE_CREATE_from'];
            }
            if (!empty($filter['DATE_CREATE_to'])) {
                $arFilter['<=DATE_CREATE'] = $filter['DATE_CREATE_to'];
            }

            $totalCount = \CIBlockElement::GetList([], $arFilter, [], false, ['ID']);
            if ($totalCount === false) {
                throw new SystemException('Требуемые элементы не найдены');
            }
            $nav->setRecordCount($totalCount);

            $elements = [];
            $list = \CIBlockElement::GetList(
                ['SORT' => 'ASC'],
                $arFilter,
                false,
                [
                    'nPageSize' => $nav->getPageSize(),
                    'iNumPage' => $nav->getCurrentPage(),
                ],
                ['ID', 'NAME', 'CODE', 'PREVIEW_TEXT', 'PREVIEW_PICTURE', 'DETAIL_TEXT', 'DETAIL_PICTURE', 'DATE_CREATE']
            );

            while ($element = $list->GetNext()) {
                if ($element['PREVIEW_PICTURE']) {
                    $element['PREVIEW_PICTURE'] = \CFile::GetPath($element['PREVIEW_PICTURE']);
                }
                if ($element['DETAIL_PICTURE']) {
                    $element['DETAIL_PICTURE'] = \CFile::GetPath($element['DETAIL_PICTURE']);
                }
                $elements[] = $element;
            }

            return [
                'elements' => $elements,
                'pagination' => [
                    'currentPage' => $nav->getCurrentPage(),
                    'pageSize' => $nav->getPageSize(),
                    'totalPages' => $nav->getPageCount(),
                    'totalElements' => $nav->getRecordCount()
                ]
            ];
        } catch (\Exception $e) {
            $this->addError(new Error($e->getMessage() ?: 'Произошла ошибка при получении списка элементов'));
        }

        return null;
    }

    /**
     * Создание элемента инфоблока
     * @param int $iblockId
     * @param array $fields
     * @return array|null
     */
    public function createElementAction(int $iblockId, array $fields): ?array
    {
        try {
            if (!$iblockId) {
                throw new ArgumentException('Необходимо указать ID инфоблока');
            }

            if (empty($fields['NAME'])) {
                throw new ArgumentException('Название элемента обязательно');
            }

            if (!empty($fields['PREVIEW_PICTURE_URL'])) {
                $previewPicture = $this->downloadAndValidateImage($fields['PREVIEW_PICTURE_URL']);
                if ($previewPicture === false) {
                    throw new SystemException('Ошибка загрузки изображения анонса');
                }
                $fields['PREVIEW_PICTURE'] = $previewPicture;
            }

            if (!empty($fields['DETAIL_PICTURE_URL'])) {
                $detailPicture = $this->downloadAndValidateImage($fields['DETAIL_PICTURE_URL']);
                if ($detailPicture === false) {
                    throw new SystemException('Ошибка загрузки детального изображения');
                }
                $fields['DETAIL_PICTURE'] = $detailPicture;
            }

            $fields['IBLOCK_ID'] = $iblockId;
            
            $el = new \CIBlockElement;
            $elementId = $el->Add($fields);

            if (!$elementId) {
                throw new SystemException($el->LAST_ERROR);
            }

            return ['ID' => $elementId];

        } catch (\Exception $e) {
            $this->addError(new Error($e->getMessage() ?: 'Произошла ошибка при создании элемента'));
        }

        return null;
    }

    /**
     * Обновление элемента инфоблока
     * @param int $elementId
     * @param array $fields
     * @return array|null
     */
    public function updateElementAction(int $elementId, array $fields): ?array
    {
        try {

            if (!$elementId) {
                throw new ArgumentException('Необходимо указать ID элемента');
            }

            $existingElement = \CIBlockElement::GetByID($elementId)->Fetch();
            if (!$existingElement) {
                throw new SystemException('Элемент не найден');
            }

            if (!empty($fields['PREVIEW_PICTURE_URL'])) {
                $previewPicture = $this->downloadAndValidateImage($fields['PREVIEW_PICTURE_URL']);
                if ($previewPicture === false) {
                    throw new SystemException('Ошибка загрузки изображения анонса');
                }
                $fields['PREVIEW_PICTURE'] = $previewPicture;
            }

            if (!empty($fields['DETAIL_PICTURE_URL'])) {
                $detailPicture = $this->downloadAndValidateImage($fields['DETAIL_PICTURE_URL']);
                if ($detailPicture === false) {
                    throw new SystemException('Ошибка загрузки детального изображения');
                }
                $fields['DETAIL_PICTURE'] = $detailPicture;
            }

            $el = new \CIBlockElement;
            $result = $el->Update($elementId, $fields);

            if (!$result) {
                throw new SystemException($el->LAST_ERROR);
            }

            return ['ID' => $elementId];

        } catch (\Exception $e) {
            $this->addError(new Error($e->getMessage() ?: 'Произошла ошибка при обновлении элемента'));
        }

        return null;
    }

    /**
     * Удаление элемента инфоблока
     * @param int $elementId
     * @return array|null
     */
    public function deleteElementAction(int $elementId): ?array
    {
        try {

            if (!$elementId) {
                throw new ArgumentException('Необходимо указать ID элемента');
            }

            $element = \CIBlockElement::GetByID($elementId)->Fetch();
            if (!$element) {
                throw new SystemException('Элемент не найден');
            }

            if (!\CIBlockElementRights::UserHasRightTo($element['IBLOCK_ID'], $elementId, 'element_delete')) {
                throw new SystemException('Недостаточно прав для удаления элемента');
            }

            $result = \CIBlockElement::Delete($elementId);
            if (!$result) {
                throw new SystemException('Ошибка при удалении элемента');
            }

            return ['ID' => $elementId];

        } catch (\Exception $e) {
            $this->addError(new Error($e->getMessage() ?: 'Произошла ошибка при удалении элемента'));
        }

        return null;
    }

    /**
     * Загрузка и валидация изображения по URL
     * @param string $url
     * @return array|null
     * @throws SystemException
     */
    private function downloadAndValidateImage(string $url): ?array
    {
        try {
            $httpClient = new HttpClient();
            $response = $httpClient->get($url);
            
            if (!$response) {
                throw new SystemException('Не удалось загрузить изображение');
            }

            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            $fileInfo = new \finfo(FILEINFO_MIME_TYPE);
            $tempFile = tempnam(sys_get_temp_dir(), 'img');
            
            if ($tempFile === false) {
                throw new SystemException('Не удалось создать временный файл');
            }

            if (file_put_contents($tempFile, $response) === false) {
                throw new SystemException('Не удалось сохранить изображение');
            }
            
            $mimeType = $fileInfo->file($tempFile);
            if (!in_array($mimeType, $allowedTypes)) {
                unlink($tempFile);
                throw new SystemException('Недопустимый формат изображения');
            }

            $file = \CFile::MakeFileArray($tempFile);
            unlink($tempFile);

            if (!$file) {
                throw new SystemException('Ошибка при обработке файла');
            }

            return $file;


        } catch (\Exception $e) {
            $this->addError(new Error($e->getMessage() ?: 'Произошла ошибка при обработке изображения'));
        }

        return null;
    }
} 