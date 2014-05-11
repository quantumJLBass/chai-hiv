<%@ Page Language="C#" %>
<script runat="server">
  protected override void OnLoad(EventArgs e)
  {
      Response.Redirect("~/center/home.castle");
    base.OnLoad(e);
  }
</script>