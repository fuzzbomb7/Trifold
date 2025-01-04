// Auto update layout
if (window.layoutHelpers) {
	window.layoutHelpers.setAutoUpdate(true);
}

function setDirty() {
	$("#navbar-dirty-data").html('<i class="dirty-data fas fa-exclamation-circle" style="color: red" title="Mobile data is out-of-sync and needs updating!"></i>');
}

$(function () {
    // Initialize sidenav
    $('#layout-sidenav').each(function () {
		new SideNav(this, {
			orientation: $(this).hasClass('sidenav-horizontal') ? 'horizontal' : 'vertical'
		});
    });

    // Initialize sidenav togglers
	$('body').on('click', '.layout-sidenav-toggle', function (e) {
		e.preventDefault();
		window.layoutHelpers.toggleCollapsed();
	});

    // Swap dropdown menus in RTL mode
    if ($('html').attr('dir') === 'rtl') {
		$('#layout-navbar .dropdown-menu').toggleClass('dropdown-menu-right');
	}
});
