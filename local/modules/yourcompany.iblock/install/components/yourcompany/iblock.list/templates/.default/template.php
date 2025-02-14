<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

/** @var array $arParams */
/** @var array $arResult */
/** @global CMain $APPLICATION */
/** @global CUser $USER */
/** @global CDatabase $DB */
/** @var CBitrixComponentTemplate $this */
/** @var string $templateName */
/** @var string $templateFile */
/** @var string $templateFolder */
/** @var string $componentPath */
/** @var CBitrixComponent $component */

use Bitrix\Main\Web\Json;
?>

<div class="iblock-list" id="iblock-list-container">
    <?php if (!empty($arResult['ITEMS'])): ?>
        <div class="iblock-list__items" id="iblock-list-items">
            <?php foreach ($arResult['ITEMS'] as $item): ?>
                <div class="iblock-list__item">
                    <?php if (in_array('NAME', $arParams['FIELDS'])): ?>
                        <h3><?= htmlspecialcharsbx($item['NAME']) ?></h3>
                    <?php endif; ?>

                    <?php if (in_array('PREVIEW_TEXT', $arParams['FIELDS'])): ?>
                        <div class="preview-text">
                            <?= htmlspecialcharsbx($item['PREVIEW_TEXT']) ?>
                        </div>
                    <?php endif; ?>

                    <?php if (in_array('DETAIL_TEXT', $arParams['FIELDS'])): ?>
                        <div class="detail-text">
                            <?= htmlspecialcharsbx($item['DETAIL_TEXT']) ?>
                        </div>
                    <?php endif; ?>

                    <?php if (in_array('PREVIEW_PICTURE', $arParams['FIELDS']) && $item['PREVIEW_PICTURE']): ?>
                        <div class="preview-picture">
                            <img src="<?= CFile::GetPath($item['PREVIEW_PICTURE']) ?>" alt="">
                        </div>
                    <?php endif; ?>

                    <?php if (in_array('DATE_CREATE', $arParams['FIELDS'])): ?>
                        <div class="date">
                            <?= FormatDate('d.m.Y', MakeTimeStamp($item['DATE_CREATE'])) ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if ($arResult['NAV_OBJECT']->getCurrentPage() < $arResult['NAV_OBJECT']->getPageCount()): ?>
            <div class="load-more">
                <button class="load-more__button" 
                        data-page="<?= $arResult['NAV_OBJECT']->getCurrentPage() + 1 ?>"
                        onclick="loadMore(this)">
                    Загрузить еще
                </button>
            </div>
        <?php endif; ?>
    <?php else: ?>
        <p>Элементы не найдены</p>
    <?php endif; ?>
</div>

<script>
function loadMore(button) {
    const container = document.getElementById('iblock-list-items');
    const page = button.dataset.page;
    
    BX.ajax.runComponentAction('yourcompany:iblock.list', 'loadMore', {
        mode: 'class',
        data: {
            page: page
        },
        signedParameters: '<?= $this->getComponent()->getSignedParameters() ?>'
    }).then(function(response) {
        if (response.data.items.length > 0) {

            response.data.items.forEach(function(item) {
                const div = document.createElement('div');
                div.className = 'iblock-list__item';
                
                let html = '';
                <?php if (in_array('NAME', $arParams['FIELDS'])): ?>
                    html += `<h3>${BX.util.htmlspecialchars(item.NAME)}</h3>`;
                <?php endif; ?>
                
                <?php if (in_array('PREVIEW_TEXT', $arParams['FIELDS'])): ?>
                    html += `<div class="preview-text">${BX.util.htmlspecialchars(item.PREVIEW_TEXT)}</div>`;
                <?php endif; ?>
                
                div.innerHTML = html;
                container.appendChild(div);
            });

            button.dataset.page = parseInt(page) + 1;
            
            if (parseInt(page) >= response.data.navObject.pageCount) {
                button.style.display = 'none';
            }
        }
    }).catch(function(response) {
        console.error(response.errors);
    });
}
</script>

<style>
.iblock-list {
    margin-bottom: 20px;
}
.iblock-list__item {
    margin-bottom: 15px;
    padding: 15px;
    border: 1px solid #eee;
}
.iblock-list__item h3 {
    margin-top: 0;
}
.load-more {
    text-align: center;
    margin-top: 20px;
}
.load-more__button {
    padding: 10px 20px;
    background: #0066cc;
    color: white;
    border: none;
    cursor: pointer;
}
.load-more__button:hover {
    background: #0052a3;
}
</style> 